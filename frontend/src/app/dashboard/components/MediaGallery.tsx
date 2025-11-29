'use client';

import { useState, useEffect } from 'react';
import { mediaApi } from '@/services/api/media';
import { StudentMedia, MediaType } from '@/types/media';
import { Student, Group } from '@/types/user';
import { getApiUrl } from '@/config/api';

interface MediaGalleryProps {
  userRole: string;
  studentId?: string;
}

export default function MediaGallery({ userRole, studentId }: MediaGalleryProps) {
  const [media, setMedia] = useState<StudentMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<StudentMedia | null>(null);
  const [filterType, setFilterType] = useState<'all' | MediaType>('all');
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchStudents();
    fetchGroups();
  }, []);

  useEffect(() => {
    if (groups.length > 0 || !selectedGroupId) {
      fetchMedia();
    }
  }, [studentId, filterType, selectedStudentId, selectedGroupId]);

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

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(getApiUrl('groups'), {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setGroups(data);
      }
    } catch (err) {
      console.error('Error loading groups:', err);
    }
  };

  const fetchMedia = async () => {
    try {
      setLoading(true);
      setError('');

      const params: any = {};

      // Priority: prop studentId > filter studentId
      if (studentId) {
        params.studentId = studentId;
      } else if (selectedStudentId) {
        params.studentId = selectedStudentId;
      } else if (selectedGroupId) {
        // If group is selected, get all students in that group
        const group = groups.find(g => g.id === selectedGroupId);
        if (group && group.students && group.students.length > 0) {
          // Filter by first student in group and then filter results by all students in frontend
          params.studentId = group.students[0].id;
        }
      }

      if (filterType !== 'all') {
        params.mediaType = filterType;
      }

      const data = await mediaApi.getAll(params);

      // Additional filtering for group
      if (selectedGroupId && !studentId) {
        const group = groups.find(g => g.id === selectedGroupId);
        if (group && group.students) {
          const groupStudentIds = group.students.map(s => s.id);
          const filteredData = data.filter(item =>
            item.students?.some(s => groupStudentIds.includes(s.id))
          );
          setMedia(filteredData);
        } else {
          setMedia(data);
        }
      } else {
        setMedia(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al cargar archivos');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (item: StudentMedia) => {
    try {
      await mediaApi.download(item);
    } catch (err) {
      console.error('Error downloading file:', err);
    }
  };

  const filteredMedia = media.filter(item => {
    if (filterType === 'all') return true;
    return item.mediaType === filterType;
  });

  const photos = filteredMedia.filter(item => item.mediaType === MediaType.PHOTO);
  const documents = filteredMedia.filter(item => item.mediaType === MediaType.DOCUMENT);

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#333', marginBottom: '1.5rem' }}>
        {userRole === 'parent' ? '📷 Galería de Mis Hijos' : '📷 Galería de Archivos'}
      </h2>

      {/* Filters Section */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Student and Group Filters */}
        {userRole !== 'parent' && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Group Filter */}
            <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#666', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Filtrar por Grupo
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => {
                  setSelectedGroupId(e.target.value);
                  setSelectedStudentId(''); // Clear student filter when group is selected
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Todos los grupos</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Filter */}
            <div style={{ flex: '1 1 200px', minWidth: '200px' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#666', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
                Filtrar por Estudiante
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setSelectedGroupId(''); // Clear group filter when student is selected
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '5px',
                  fontSize: '0.875rem',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                <option value="">Todos los estudiantes</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {(selectedGroupId || selectedStudentId) && (
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  onClick={() => {
                    setSelectedGroupId('');
                    setSelectedStudentId('');
                  }}
                  style={{
                    padding: '0.5rem 1rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '5px',
                    backgroundColor: 'white',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}
                >
                  Limpiar Filtros
                </button>
              </div>
            )}
          </div>
        )}

        {/* Media Type Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterType('all')}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem',
              backgroundColor: filterType === 'all' ? '#3b82f6' : '#f3f4f6',
              color: filterType === 'all' ? 'white' : '#333'
            }}
          >
            Todos ({media.length})
          </button>
          <button
            onClick={() => setFilterType(MediaType.PHOTO)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem',
              backgroundColor: filterType === MediaType.PHOTO ? '#3b82f6' : '#f3f4f6',
              color: filterType === MediaType.PHOTO ? 'white' : '#333'
            }}
          >
            Fotos ({photos.length})
          </button>
          <button
            onClick={() => setFilterType(MediaType.DOCUMENT)}
            style={{
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '0.875rem',
              backgroundColor: filterType === MediaType.DOCUMENT ? '#3b82f6' : '#f3f4f6',
              color: filterType === MediaType.DOCUMENT ? 'white' : '#333'
            }}
          >
            Documentos ({documents.length})
          </button>
        </div>
      </div>

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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div>Cargando archivos...</div>
        </div>
      ) : filteredMedia.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
          <p style={{ color: '#666', fontSize: '0.95rem' }}>
            No hay {filterType !== 'all' ? (filterType === MediaType.PHOTO ? 'fotos' : 'documentos') : 'archivos'} disponibles
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'box-shadow 0.2s',
                backgroundColor: 'white'
              }}
              onClick={() => setSelectedMedia(item)}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* Thumbnail */}
              <div style={{
                aspectRatio: '1',
                backgroundColor: '#f3f4f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'relative'
              }}>
                {mediaApi.isImage(item.mimeType) ? (
                  <img
                    src={item.fileUrl}
                    alt={item.originalFileName}
                    loading="lazy"
                    onError={(e) => {
                      console.error('Failed to load image:', item.fileUrl);
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const errorIcon = document.createElement('span');
                        errorIcon.innerHTML = '🖼️';
                        errorIcon.style.fontSize = '4rem';
                        parent.appendChild(errorIcon);
                      }
                    }}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block'
                    }}
                  />
                ) : mediaApi.isPDF(item.mimeType) ? (
                  <span style={{ fontSize: '4rem' }}>📄</span>
                ) : (
                  <span style={{ fontSize: '4rem' }}>📎</span>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: '0.75rem' }}>
                <p style={{
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#333',
                  margin: 0,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.originalFileName}
                </p>
                {item.description && (
                  <p style={{
                    fontSize: '0.75rem',
                    color: '#666',
                    margin: '0.25rem 0 0 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {item.description}
                  </p>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '0.5rem'
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#666' }}>
                    {new Date(item.uploadedAt).toLocaleDateString('es')}
                  </span>
                  {item.students && item.students.length > 0 && (
                    <span style={{
                      fontSize: '0.7rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '10px',
                      backgroundColor: '#eff6ff',
                      color: '#2563eb',
                      fontWeight: '500'
                    }}>
                      {item.students.length} niño{item.students.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Detail Modal */}
      {selectedMedia && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '0' : '2rem',
            zIndex: 50,
            overflow: 'auto'
          }}
          onClick={() => setSelectedMedia(null)}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: isMobile ? '0' : '8px',
              maxWidth: isMobile ? '100%' : '700px',
              width: isMobile ? '100%' : 'auto',
              height: isMobile ? '100%' : 'auto',
              maxHeight: isMobile ? '100%' : '85vh',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #e5e7eb',
              flexShrink: 0
            }}>
              <div style={{ flex: 1, paddingRight: '1rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#333', margin: 0 }}>
                  {selectedMedia.originalFileName}
                </h3>
                <p style={{ fontSize: '0.8125rem', color: '#666', margin: '0.25rem 0 0 0' }}>
                  {mediaApi.formatFileSize(selectedMedia.fileSize)} • Subido el{' '}
                  {new Date(selectedMedia.uploadedAt).toLocaleString('es')}
                </p>
              </div>
              <button
                onClick={() => setSelectedMedia(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#666',
                  padding: '0',
                  lineHeight: 1
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div style={{
              flex: 1,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Media Preview */}
              <div style={{
                flex: mediaApi.isImage(selectedMedia.mimeType) ? 1 : 0,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0.5rem',
                minHeight: mediaApi.isImage(selectedMedia.mimeType) ? '200px' : 'auto',
                maxHeight: '100%',
                backgroundColor: '#000',
                overflow: 'hidden'
              }}>
                {mediaApi.isImage(selectedMedia.mimeType) ? (
                  <img
                    src={selectedMedia.fileUrl}
                    alt={selectedMedia.originalFileName}
                    onError={() => {
                      console.error('Failed to load full image:', selectedMedia.fileUrl);
                    }}
                    style={{
                      maxWidth: isMobile ? '100%' : '90%',
                      maxHeight: isMobile ? '100%' : '70vh',
                      width: 'auto',
                      height: 'auto',
                      objectFit: 'contain',
                      display: 'block',
                      touchAction: 'pinch-zoom'
                    }}
                  />
                ) : (
                  <div style={{
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    padding: '3rem',
                    textAlign: 'center',
                    width: '100%',
                    margin: '1.5rem'
                  }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                      {mediaApi.isPDF(selectedMedia.mimeType) ? '📄' : '📎'}
                    </div>
                    <p style={{ color: '#666', margin: 0 }}>{selectedMedia.originalFileName}</p>
                  </div>
                )}
              </div>

              {/* Details Section */}
              <div style={{ padding: '1rem 1.5rem', backgroundColor: 'white' }}>

              {/* Description */}
              {selectedMedia.description && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
                    Descripción
                  </h4>
                  <p style={{ color: '#666', margin: 0, fontSize: '0.875rem' }}>
                    {selectedMedia.description}
                  </p>
                </div>
              )}

              {/* Tagged Students */}
              {selectedMedia.students && selectedMedia.students.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
                    Estudiantes Etiquetados
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {selectedMedia.students.map((student) => (
                      <span
                        key={student.id}
                        style={{
                          padding: '0.375rem 0.75rem',
                          backgroundColor: '#eff6ff',
                          color: '#2563eb',
                          borderRadius: '15px',
                          fontSize: '0.8125rem',
                          fontWeight: '500'
                        }}
                      >
                        {student.firstName} {student.lastName}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Uploader Info (not shown to parents) */}
              {userRole !== 'parent' && selectedMedia.uploadedBy && (
                <div style={{ marginBottom: '0' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#333', marginBottom: '0.5rem' }}>
                    Subido Por
                  </h4>
                  <p style={{ color: '#666', margin: 0, fontSize: '0.875rem' }}>
                    {selectedMedia.uploadedBy.firstName} {selectedMedia.uploadedBy.lastName}
                    {selectedMedia.uploadedBy.email && (
                      <span style={{ color: '#9ca3af' }}> ({selectedMedia.uploadedBy.email})</span>
                    )}
                  </p>
                </div>
              )}
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              padding: '1rem 1.5rem',
              borderTop: '1px solid #e5e7eb',
              flexShrink: 0,
              backgroundColor: 'white'
            }}>
              <button
                onClick={() => handleDownload(selectedMedia)}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  borderRadius: '5px',
                  backgroundColor: '#22c55e',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem'
                }}
              >
                Descargar
              </button>
              <button
                onClick={() => setSelectedMedia(null)}
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
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
