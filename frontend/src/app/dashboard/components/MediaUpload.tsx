'use client';

import { useState, useEffect, useRef } from 'react';
import { mediaApi } from '@/services/api/media';
import { MediaType, MediaUploadFormData } from '@/types/media';
import { Student } from '@/types/user';
import { getApiUrl } from '@/config/api';

interface MediaUploadProps {
  userRole: string;
  onUploadSuccess?: () => void;
}

export default function MediaUpload({ userRole, onUploadSuccess }: MediaUploadProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<MediaType>(MediaType.PHOTO);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('students'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        setError('Error al cargar estudiantes');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo debe ser menor a 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileChange(files[0]);
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Por favor selecciona un archivo');
      return;
    }

    if (selectedStudents.length === 0) {
      setError('Por favor selecciona al menos un estudiante');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const uploadData: MediaUploadFormData = {
        file: selectedFile,
        mediaType,
        description: description.trim() || undefined,
        studentIds: selectedStudents,
      };

      await mediaApi.upload(uploadData);

      setSuccess('✅ Archivo subido exitosamente!');

      // Reset form
      setSelectedFile(null);
      setPreview(null);
      setDescription('');
      setSelectedStudents([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call success callback
      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al subir archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreview(null);
    setDescription('');
    setSelectedStudents([]);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Check if user can upload
  if (userRole === 'parent') {
    return (
      <div style={{
        backgroundColor: '#fef3c7',
        border: '1px solid #fbbf24',
        borderRadius: '8px',
        padding: '1rem',
        textAlign: 'center',
        color: '#92400e'
      }}>
        <p style={{ margin: 0 }}>Los padres no pueden subir archivos.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#333' }}>
        ⬆️ Subir Foto o Documento
      </h2>

      {error && (
        <div style={{
          backgroundColor: '#fee',
          color: '#c53030',
          padding: '0.75rem',
          borderRadius: '5px',
          marginBottom: '1rem',
          border: '1px solid #feb2b2'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          backgroundColor: '#d1fae5',
          color: '#065f46',
          padding: '0.75rem',
          borderRadius: '5px',
          marginBottom: '1rem',
          border: '1px solid #6ee7b7'
        }}>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Media Type Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>
            Tipo de Archivo
          </label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value={MediaType.PHOTO}
                checked={mediaType === MediaType.PHOTO}
                onChange={(e) => setMediaType(e.target.value as MediaType)}
                style={{ marginRight: '0.5rem' }}
              />
              <span style={{ fontSize: '0.875rem' }}>📷 Foto</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="radio"
                value={MediaType.DOCUMENT}
                checked={mediaType === MediaType.DOCUMENT}
                onChange={(e) => setMediaType(e.target.value as MediaType)}
                style={{ marginRight: '0.5rem' }}
              />
              <span style={{ fontSize: '0.875rem' }}>📄 Documento</span>
            </label>
          </div>
        </div>

        {/* File Upload Area */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>
            Seleccionar Archivo
          </label>

          <div
            style={{
              border: isDragging ? '2px dashed #3b82f6' : '2px dashed #d1d5db',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: isDragging ? '#eff6ff' : '#f9fafb',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !selectedFile && fileInputRef.current?.click()}
          >
            {selectedFile ? (
              <div>
                {preview ? (
                  <img
                    src={preview}
                    alt="Vista previa"
                    style={{
                      maxWidth: '300px',
                      maxHeight: '200px',
                      marginBottom: '1rem',
                      borderRadius: '8px',
                      objectFit: 'contain'
                    }}
                  />
                ) : (
                  <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
                )}
                <p style={{ fontSize: '0.875rem', fontWeight: '500', color: '#333', margin: '0.5rem 0' }}>
                  {selectedFile.name}
                </p>
                <p style={{ fontSize: '0.75rem', color: '#666', margin: '0.25rem 0' }}>
                  {mediaApi.formatFileSize(selectedFile.size)}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileChange(null);
                  }}
                  style={{
                    marginTop: '0.75rem',
                    fontSize: '0.875rem',
                    color: '#ef4444',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Quitar archivo
                </button>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>☁️</div>
                <p style={{ fontSize: '0.875rem', color: '#333', margin: '0.5rem 0' }}>
                  <span style={{ color: '#3b82f6', fontWeight: '500' }}>Click para subir</span>
                  {' '}o arrastra y suelta
                </p>
                <p style={{ fontSize: '0.75rem', color: '#666', margin: '0.25rem 0' }}>
                  Tamaño máximo: 10MB
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
            accept={mediaType === MediaType.PHOTO ? 'image/*' : '*'}
            style={{ display: 'none' }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>
            Descripción (Opcional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '5px',
              fontSize: '0.875rem',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
            placeholder="Agrega una descripción del archivo..."
          />
        </div>

        {/* Student Selection */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>
            Etiquetar Estudiantes *
          </label>
          {loading ? (
            <p style={{ color: '#666', fontSize: '0.875rem' }}>Cargando estudiantes...</p>
          ) : (
            <div style={{
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '1rem',
              maxHeight: '300px',
              overflowY: 'auto',
              backgroundColor: '#f9fafb'
            }}>
              {students.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#666', fontSize: '0.875rem', margin: 0 }}>
                  No hay estudiantes disponibles
                </p>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '0.5rem'
                }}>
                  {students.map((student) => (
                    <label
                      key={student.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.625rem',
                        cursor: 'pointer',
                        borderRadius: '5px',
                        backgroundColor: selectedStudents.includes(student.id) ? '#eff6ff' : 'white',
                        border: selectedStudents.includes(student.id) ? '1px solid #3b82f6' : '1px solid #e5e7eb'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={() => handleStudentToggle(student.id)}
                        style={{ marginRight: '0.5rem' }}
                      />
                      <span style={{ fontSize: '0.875rem', color: '#333' }}>
                        {student.firstName} {student.lastName}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}
          {selectedStudents.length > 0 && (
            <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem', marginBottom: 0 }}>
              {selectedStudents.length} estudiante(s) seleccionado(s)
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={handleCancel}
            style={{
              padding: '0.75rem 1.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '5px',
              backgroundColor: 'white',
              color: '#333',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem'
            }}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={uploading || !selectedFile || selectedStudents.length === 0}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderRadius: '5px',
              backgroundColor: uploading || !selectedFile || selectedStudents.length === 0 ? '#9ca3af' : '#22c55e',
              color: 'white',
              cursor: uploading || !selectedFile || selectedStudents.length === 0 ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}
          >
            {uploading ? 'Subiendo...' : 'Subir Archivo'}
          </button>
        </div>
      </form>
    </div>
  );
}
