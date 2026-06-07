package service

import (
	"context"
	"encoding/json"
	"fmt"
	"html"
	"net/http"
	"net/url"
	"strings"
	"time"
	"unicode"
)

var contentLanguages = []string{"en", "ru", "kk"}

func detectContentLanguage(values ...string) string {
	text := strings.Join(values, " ")
	hasCyrillic := false

	for _, r := range text {
		switch r {
		case '\u04d9', '\u0493', '\u049b', '\u04a3', '\u04e9', '\u04b1', '\u04af', '\u04bb', '\u0456',
			'\u04d8', '\u0492', '\u049a', '\u04a2', '\u04e8', '\u04b0', '\u04ae', '\u04ba', '\u0406':
			return "kk"
		}
		if unicode.In(r, unicode.Cyrillic) {
			hasCyrillic = true
		}
	}

	if hasCyrillic {
		return "ru"
	}
	return "en"
}

func translateContent(ctx context.Context, text, sourceLang, targetLang string) string {
	text = strings.TrimSpace(text)
	if text == "" || sourceLang == targetLang {
		return text
	}

	ctx, cancel := context.WithTimeout(ctx, 12*time.Second)
	defer cancel()

	if translated := translateWithGoogle(ctx, text, sourceLang, targetLang); translated != "" {
		return translated
	}
	if translated := translateWithMyMemory(ctx, text, sourceLang, targetLang); translated != "" {
		return translated
	}

	return text
}

func translateWithGoogle(ctx context.Context, text, sourceLang, targetLang string) string {
	endpoint := "https://translate.googleapis.com/translate_a/single"
	query := url.Values{}
	query.Set("client", "gtx")
	query.Set("sl", sourceLang)
	query.Set("tl", targetLang)
	query.Set("dt", "t")
	query.Set("q", text)

	resp, err := doTranslationRequest(ctx, endpoint, query)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return ""
	}

	var payload []any
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return ""
	}
	if len(payload) == 0 {
		return ""
	}

	parts, ok := payload[0].([]any)
	if !ok {
		return ""
	}

	var translated strings.Builder
	for _, rawPart := range parts {
		part, ok := rawPart.([]any)
		if ok && len(part) > 0 {
			translated.WriteString(fmt.Sprint(part[0]))
		}
	}

	result := strings.TrimSpace(translated.String())
	if result == "" || result == text {
		return ""
	}
	return result
}

func translateWithMyMemory(ctx context.Context, text, sourceLang, targetLang string) string {
	endpoint := "https://api.mymemory.translated.net/get"
	query := url.Values{}
	query.Set("q", text)
	query.Set("langpair", sourceLang+"|"+targetLang)

	resp, err := doTranslationRequest(ctx, endpoint, query)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return ""
	}

	var payload struct {
		ResponseData struct {
			TranslatedText string `json:"translatedText"`
		} `json:"responseData"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&payload); err != nil {
		return ""
	}

	result := strings.TrimSpace(html.UnescapeString(payload.ResponseData.TranslatedText))
	if result == "" || result == text {
		return ""
	}
	return result
}

func doTranslationRequest(ctx context.Context, endpoint string, query url.Values) (*http.Response, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint+"?"+query.Encode(), nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("User-Agent", "VTuberForge/1.0")
	return http.DefaultClient.Do(req)
}
