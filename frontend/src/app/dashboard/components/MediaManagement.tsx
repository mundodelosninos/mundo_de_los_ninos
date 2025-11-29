'use client';

import { useState } from 'react';
import MediaUpload from './MediaUpload';
import MediaGallery from './MediaGallery';
import { mediaApi } from '@/services/api/media';
import { StudentMedia, UpdateMediaDto, MediaType } from '@/types/media';
import { Student } from '@/types/user';
import { getApiUrl } from '@/config/api';

interface MediaManagementProps {
  userRole: string;
}

export default function MediaManagement({ userRole }: MediaManagementProps) {
  const [activeTab, setActiveTab] = useState<'gallery' | 'upload' | 'manage'>('gallery');
  const [media, setMedia] = useState<StudentMedia[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingMedia, setEditingMedia] = useState<StudentMedia | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editStudentIds, setEditStudentIds] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<StudentMedia | null>(null);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await mediaApi.getAll();
      setMedia(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar archivos');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('students'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (err) {
      console.error('Error loading students:', err);
    }
  };

  const handleUploadSuccess = () => {
    setSuccess('✅ Archivo subido exitosamente!');
    fetchMedia();
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEdit = (item: StudentMedia) => {
    setEditingMedia(item);
    setEditDescription(item.description || '');
    setEditStudentIds(item.students?.map(s => s.id) || []);
    setShowEditModal(true);
    if (students.length === 0) {
      fetchStudents();
    }
  };

  const handleUpdateSubmit = async () => {
    if (!editingMedia) return;

    try {
      setLoading(true);
      setError('');

      const updateData: UpdateMediaDto = {
        description: editDescription.trim() || undefined,
        studentIds: editStudentIds,
      };

      await mediaApi.update(editingMedia.id, updateData);

      setSuccess('✅ Archivo actualizado exitosamente!');
      setShowEditModal(false);
      setEditingMedia(null);
      fetchMedia();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al actualizar archivo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item: StudentMedia) => {
    try {
      setLoading(true);
      setError('');

      await mediaApi.delete(item.id);

      setSuccess('✅ Archivo eliminado exitosamente!');
      setShowDeleteConfirm(null);
      fetchMedia();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al eliminar archivo');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentToggle = (studentId: string) => {
    setEditStudentIds(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  return (
    <div>
      {/* Tabs */}
      <div style={{ marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
        <nav style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('gallery')}
            style={{
              padding: '0.75rem 0',
              borderBottom: activeTab === 'gallery' ? '2px solid #3b82f6' : '2px solid transparent',
              background: 'none',
              border: 'none',
              fontWeight: activeTab === 'gallery' ? '600' : '400',
              color: activeTab === 'gallery' ? '#3b82f6' : '#666',
              cursor: 'pointer',
              fontSize: '0.95rem',
              marginBottom: '-2px'
            }}
          >
            📷 Galería
          </button>
          {userRole !== 'parent' && (
            <>
              <button
                onClick={() => setActiveTab('upload')}
                style={{
                  padding: '0.75rem 0',
                  borderBottom: activeTab === 'upload' ? '2px solid #3b82f6' : '2px solid transparent',
                  background: 'none',
                  border: 'none',
                  fontWeight: activeTab === 'upload' ? '600' : '400',
                  color: activeTab === 'upload' ? '#3b82f6' : '#666',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  marginBottom: '-2px'
                }}
              >
                ⬆️ Subir
              </button>
              <button
                onClick={() => {
                  setActiveTab('manage');
                  fetchMedia();
                }}
                style={{
                  padding: '0.75rem 0',
                  borderBottom: activeTab === 'manage' ? '2px solid #3b82f6' : '2px solid transparent',
                  background: 'none',
                  border: 'none',
                  fontWeight: activeTab === 'manage' ? '600' : '400',
                  color: activeTab === 'manage' ? '#3b82f6' : '#666',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  marginBottom: '-2px'
                }}
              >
                ⚙️ Administrar
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Success/Error Messages */}
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

      {/* Tab Content */}
      {activeTab === 'gallery' && <MediaGallery userRole={userRole} />}

      {activeTab === 'upload' && userRole !== 'parent' && (
        <MediaUpload userRole={userRole} onUploadSuccess={handleUploadSuccess} />
      )}

      {activeTab === 'manage' && userRole !== 'parent' && (
        <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '1.5rem' }}>
            ⚙️ Administrar Archivos
          </h2>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div>Cargando archivos...</div>
            </div>
          ) : media.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              No hay archivos disponibles
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f9fafb' }}>
                  <tr>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#666', textTransform: 'uppercase' }}>
                      Archivo
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#666', textTransform: 'uppercase' }}>
                      Tipo
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#666', textTransform: 'uppercase' }}>
                      Estudiantes
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#666', textTransform: 'uppercase' }}>
                      Fecha
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: '500', color: '#666', textTransform: 'uppercase' }}>
                      Tamaño
                    </th>
                    <th style={{ padding: '0.75rem', textAlign: 'right', fontSize: '0.75rem', fontWeight: '500', color: '#666', textTransform: 'uppercase' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody style={{ backgroundColor: 'white' }}>
                  {media.map((item, index) => (
                    <tr key={item.id} style={{ borderTop: index > 0 ? '1px solid #e5e7eb' : 'none' }}>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {mediaApi.isImage(item.mimeType) ? (
                            <img
                              src={item.fileUrl}
                              alt={item.originalFileName}
                              style={{ width: '40px', height: '40px', borderRadius: '5px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div style={{ width: '40px', height: '40px', borderRadius: '5px', backgroundColor: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <span style={{ fontSize: '1.25rem' }}>📄</span>
                            </div>
                          )}
                          <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                              {item.originalFileName}
                            </div>
                            {item.description && (
                              <div style={{ fontSize: '0.75rem', color: '#666', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                                {item.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            borderRadius: '12px',
                            backgroundColor: item.mediaType === MediaType.PHOTO ? '#dbeafe' : '#d1fae5',
                            color: item.mediaType === MediaType.PHOTO ? '#1e40af' : '#065f46'
                          }}
                        >
                          {item.mediaType === MediaType.PHOTO ? 'Foto' : 'Documento'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
                        {item.students?.length || 0} estudiante(s)
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
                        {new Date(item.uploadedAt).toLocaleDateString('es')}
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#666' }}>
                        {mediaApi.formatFileSize(item.fileSize)}
                      </td>
                      <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                        <button
                          onClick={() => mediaApi.download(item)}
                          style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', marginRight: '1rem', fontSize: '0.875rem', fontWeight: '500' }}
                        >
                          Descargar
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          style={{ background: 'none', border: 'none', color: '#8b5cf6', cursor: 'pointer', marginRight: '1rem', fontSize: '0.875rem', fontWeight: '500' }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(item)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '500' }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingMedia && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 50
          }}
          onClick={() => setShowEditModal(false)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '1.5rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>
              Editar Archivo
            </h3>

            {/* Description */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>
                Descripción
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit'
                }}
                placeholder="Agrega una descripción..."
              />
            </div>

            {/* Student Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#333', marginBottom: '0.5rem' }}>
                Estudiantes Etiquetados
              </label>
              <div style={{ border: '1px solid #d1d5db', borderRadius: '5px', padding: '1rem', maxHeight: '250px', overflowY: 'auto' }}>
                {students.length === 0 ? (
                  <p style={{ textAlign: 'center', color: '#666', fontSize: '0.875rem' }}>Cargando estudiantes...</p>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                    {students.map((student) => (
                      <label
                        key={student.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0.5rem',
                          cursor: 'pointer',
                          borderRadius: '5px',
                          backgroundColor: editStudentIds.includes(student.id) ? '#eff6ff' : 'transparent'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={editStudentIds.includes(student.id)}
                          onChange={() => handleStudentToggle(student.id)}
                          style={{ marginRight: '0.5rem' }}
                        />
                        <span style={{ fontSize: '0.875rem' }}>{student.firstName} {student.lastName}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setShowEditModal(false)}
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
                onClick={handleUpdateSubmit}
                disabled={loading || editStudentIds.length === 0}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '5px',
                  backgroundColor: loading || editStudentIds.length === 0 ? '#9ca3af' : '#3b82f6',
                  color: 'white',
                  cursor: loading || editStudentIds.length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 50
          }}
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              maxWidth: '400px',
              width: '100%',
              padding: '1.5rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem', color: '#333' }}>
              Eliminar Archivo
            </h3>
            <p style={{ color: '#666', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
              ¿Estás seguro de que deseas eliminar "{showDeleteConfirm.originalFileName}"? Esta acción no se puede deshacer.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setShowDeleteConfirm(null)}
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
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '5px',
                  backgroundColor: loading ? '#9ca3af' : '#ef4444',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}
              >
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
