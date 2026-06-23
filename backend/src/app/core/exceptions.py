from fastapi import Request
from fastapi.responses import JSONResponse


class SynapseException(Exception):
    """Base class for all domain-level exceptions. Register with FastAPI's exception handler."""

    status_code: int = 500
    detail: str = "An unexpected error occurred."

    def __init__(self, detail: str | None = None) -> None:
        if detail is not None:
            self.detail = detail
        super().__init__(self.detail)


class NotFoundError(SynapseException):
    status_code = 404
    detail = "Resource not found."


class ConflictError(SynapseException):
    status_code = 409
    detail = "Resource already exists or conflicts with current state."


class UnauthorizedError(SynapseException):
    status_code = 401
    detail = "Authentication required."


class InvalidTokenError(SynapseException):
    status_code = 401
    detail = "Token is invalid or expired."


class ForbiddenError(SynapseException):
    status_code = 403
    detail = "You do not have permission to perform this action."


class BadRequestError(SynapseException):
    status_code = 400
    detail = "The request could not be understood or was missing required parameters."


class UnprocessableError(SynapseException):
    status_code = 422
    detail = "The request was well-formed but contained semantic errors."


# ---------------------------------------------------------------------------
# FastAPI exception handler — register in main.py
# ---------------------------------------------------------------------------


async def synapse_exception_handler(request: Request, exc: SynapseException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
    )
