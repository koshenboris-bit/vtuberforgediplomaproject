package handler

import (
	"encoding/json"
	"net/http"
	"strconv"

	"backend-service/internal/domain"
	"backend-service/internal/middleware"
	"backend-service/internal/service"

	"github.com/go-chi/chi/v5"
)

type NewsHandler struct {
	svc *service.NewsService
}

func NewNewsHandler(svc *service.NewsService) *NewsHandler {
	return &NewsHandler{svc: svc}
}

func (h *NewsHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.UserID(r.Context())
	items, err := h.svc.List(r.Context(), userID)
	if err != nil {
		writeDomainError(w, err)
		return
	}

	jsonResponse(w, http.StatusOK, items)
}

func (h *NewsHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req domain.NewsRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "invalid json")
		return
	}

	item, err := h.svc.Create(r.Context(), req)
	if err != nil {
		writeDomainError(w, err)
		return
	}

	jsonResponse(w, http.StatusCreated, item)
}

func (h *NewsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
	if err != nil {
		jsonError(w, http.StatusBadRequest, "invalid id")
		return
	}

	if err := h.svc.Delete(r.Context(), id); err != nil {
		writeDomainError(w, err)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

func (h *NewsHandler) ToggleLike(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserID(r.Context())
	if !ok {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	newsID, err := parseNewsID(r)
	if err != nil {
		jsonError(w, http.StatusBadRequest, "invalid id")
		return
	}

	result, err := h.svc.ToggleLike(r.Context(), userID, newsID)
	if err != nil {
		writeDomainError(w, err)
		return
	}
	jsonResponse(w, http.StatusOK, result)
}

func (h *NewsHandler) ToggleSave(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserID(r.Context())
	if !ok {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	newsID, err := parseNewsID(r)
	if err != nil {
		jsonError(w, http.StatusBadRequest, "invalid id")
		return
	}

	result, err := h.svc.ToggleSave(r.Context(), userID, newsID)
	if err != nil {
		writeDomainError(w, err)
		return
	}
	jsonResponse(w, http.StatusOK, result)
}

func (h *NewsHandler) AddComment(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserID(r.Context())
	if !ok {
		jsonError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	newsID, err := parseNewsID(r)
	if err != nil {
		jsonError(w, http.StatusBadRequest, "invalid id")
		return
	}

	var req domain.NewsCommentRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, http.StatusBadRequest, "invalid json")
		return
	}

	comment, err := h.svc.AddComment(r.Context(), userID, newsID, req)
	if err != nil {
		writeDomainError(w, err)
		return
	}
	jsonResponse(w, http.StatusCreated, comment)
}

func parseNewsID(r *http.Request) (int64, error) {
	return strconv.ParseInt(chi.URLParam(r, "id"), 10, 64)
}
