import os
import shutil
from datetime import datetime
from typing import Optional, BinaryIO
from fastapi import UploadFile
import aiofiles
import uuid
from pathlib import Path

from app.core.config import get_settings

settings = get_settings()

# Configure base storage path
STORAGE_BASE_PATH = Path(settings.STORAGE_PATH) if hasattr(settings, 'STORAGE_PATH') else Path("storage")
CHUNK_SIZE = 1024 * 1024  # 1MB chunks for streaming


class FileService:
    """Service for handling medical document files."""
    
    @staticmethod
    def get_patient_storage_path(patient_id: int) -> Path:
        """Get the storage path for a patient's files."""
        return STORAGE_BASE_PATH / f"patient_{patient_id}"
    
    @staticmethod
    async def save_file(
        file: UploadFile,
        patient_id: int,
        record_type: str
    ) -> tuple[str, str]:
        """
        Save an uploaded file to patient's storage.
        
        Args:
            file: The uploaded file
            patient_id: ID of the patient
            record_type: Type of medical record
            
        Returns:
            Tuple of (file_path, mime_type)
        """
        # Create patient directory if it doesn't exist
        patient_path = FileService.get_patient_storage_path(patient_id)
        patient_path.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        unique_id = uuid.uuid4().hex[:8]
        file_extension = Path(file.filename).suffix if file.filename else ""
        filename = f"{record_type}_{timestamp}_{unique_id}{file_extension}"
        
        file_path = patient_path / filename
        
        # Save file in chunks to handle large files
        async with aiofiles.open(file_path, 'wb') as out_file:
            while content := await file.read(CHUNK_SIZE):
                await out_file.write(content)
        
        return str(file_path.relative_to(STORAGE_BASE_PATH)), file.content_type
    
    @staticmethod
    async def read_file(file_path: str) -> Optional[Path]:
        """
        Get the full path to a stored file.
        
        Args:
            file_path: Relative path to the file
            
        Returns:
            Full path to the file if it exists, None otherwise
        """
        full_path = STORAGE_BASE_PATH / file_path
        return full_path if full_path.is_file() else None
    
    @staticmethod
    async def delete_file(file_path: str) -> bool:
        """
        Delete a stored file.
        
        Args:
            file_path: Relative path to the file
            
        Returns:
            True if file was deleted, False otherwise
        """
        full_path = STORAGE_BASE_PATH / file_path
        try:
            full_path.unlink()
            # Remove empty parent directories
            parent = full_path.parent
            while parent != STORAGE_BASE_PATH and not any(parent.iterdir()):
                parent.rmdir()
                parent = parent.parent
            return True
        except (FileNotFoundError, PermissionError):
            return False
    
    @staticmethod
    async def stream_file(file_path: str) -> Optional[BinaryIO]:
        """
        Get a file stream for downloading.
        
        Args:
            file_path: Relative path to the file
            
        Returns:
            File stream if file exists, None otherwise
        """
        full_path = STORAGE_BASE_PATH / file_path
        try:
            return open(full_path, 'rb')
        except (FileNotFoundError, PermissionError):
            return None
    
    @staticmethod
    async def move_file(
        old_path: str,
        new_patient_id: int,
        new_record_type: str
    ) -> Optional[str]:
        """
        Move a file to a new patient's storage.
        
        Args:
            old_path: Current relative path to the file
            new_patient_id: ID of the new patient
            new_record_type: New record type
            
        Returns:
            New relative path if successful, None otherwise
        """
        old_full_path = STORAGE_BASE_PATH / old_path
        if not old_full_path.is_file():
            return None
        
        # Create new patient directory if needed
        new_patient_path = FileService.get_patient_storage_path(new_patient_id)
        new_patient_path.mkdir(parents=True, exist_ok=True)
        
        # Generate new filename
        timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        unique_id = uuid.uuid4().hex[:8]
        file_extension = old_full_path.suffix
        new_filename = f"{new_record_type}_{timestamp}_{unique_id}{file_extension}"
        
        new_full_path = new_patient_path / new_filename
        
        try:
            shutil.move(str(old_full_path), str(new_full_path))
            return str(new_full_path.relative_to(STORAGE_BASE_PATH))
        except (FileNotFoundError, PermissionError):
            return None 