from pydantic import BaseModel, Field
from datetime import datetime

class Content(BaseModel):
    title: str = Field(..., min_length=1)
    started: datetime = Field(default_factory=datetime.now)
    progress: int = Field(..., ge=0, le=100)