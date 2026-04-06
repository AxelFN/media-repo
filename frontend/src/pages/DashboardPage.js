import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Plus, Upload, Trash2, Edit2, Image as ImageIcon, Video, Eye, X } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

function formatApiErrorDetail(detail) {
  if (detail == null) return "Algo salió mal. Intenta de nuevo.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedPub, setSelectedPub] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  // Upload form state
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const token = localStorage.getItem('access_token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const { data } = await axios.get(`${API}/api/publications/my`, {
        withCredentials: true,
        headers: authHeaders
      });
      setPublications(data);
    } catch (e) {
      toast.error('Error al cargar publicaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Selecciona un archivo');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(
        `${API}/api/publications/upload?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
            ...authHeaders
          }
        }
      );
      toast.success('Publicación subida exitosamente');
      setUploadOpen(false);
      setFile(null);
      setTitle('');
      setDescription('');
      fetchPublications();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || 'Error al subir');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/api/publications/${selectedPub.id}`, {
        title: selectedPub.title,
        description: selectedPub.description
      }, {
        withCredentials: true,
        headers: authHeaders
      });
      toast.success('Publicación actualizada');
      setEditOpen(false);
      fetchPublications();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || 'Error al actualizar');
    }
  };

  const handleDelete = async (pubId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta publicación?')) return;
    
    try {
      await axios.delete(`${API}/api/publications/${pubId}`, {
        withCredentials: true,
        headers: authHeaders
      });
      toast.success('Publicación eliminada');
      fetchPublications();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || 'Error al eliminar');
    }
  };

  const getFileUrl = (path) => {
    const tokenParam = token ? `?auth=${token}` : '';
    return `${API}/api/files/${path}${tokenParam}`;
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  };

  const statusLabels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado'
  };

  return (
    <div className="container mx-auto px-4 py-8" data-testid="dashboard">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mi Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Bienvenido, {user?.name}. Gestiona tus publicaciones aquí.
          </p>
        </div>
        
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button data-testid="upload-btn">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Publicación
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Subir Publicación</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título de la publicación"
                  required
                  data-testid="upload-title-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción (opcional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe tu publicación..."
                  rows={3}
                  data-testid="upload-description-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">Archivo</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => setFile(e.target.files[0])}
                  required
                  data-testid="upload-file-input"
                />
                <p className="text-xs text-muted-foreground">
                  Formatos: JPG, PNG, GIF, WebP, MP4, WebM, MOV
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={uploading} data-testid="upload-submit-btn">
                <Upload className="w-4 h-4 mr-2" />
                {uploading ? 'Subiendo...' : 'Subir'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted" />
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : publications.length === 0 ? (
        <Card className="text-center py-12" data-testid="empty-state">
          <CardContent>
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Sin publicaciones</h3>
            <p className="text-muted-foreground mb-4">
              Aún no has subido ninguna publicación
            </p>
            <Button onClick={() => setUploadOpen(true)} data-testid="empty-upload-btn">
              <Plus className="w-4 h-4 mr-2" />
              Subir Primera Publicación
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {publications.map((pub, index) => (
            <Card 
              key={pub.id} 
              className={`overflow-hidden animate-fade-in stagger-${index % 4 + 1} group`}
              data-testid={`publication-card-${pub.id}`}
            >
              <div className="aspect-video bg-muted relative overflow-hidden">
                {pub.file_type === 'video' ? (
                  <video
                    src={getFileUrl(pub.storage_path)}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={getFileUrl(pub.storage_path)}
                    alt={pub.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1688516353448-2351953b4b76?w=400&h=300&fit=crop';
                    }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        setSelectedPub(pub);
                        setPreviewOpen(true);
                      }}
                      data-testid={`preview-btn-${pub.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => {
                        setSelectedPub({ ...pub });
                        setEditOpen(true);
                      }}
                      data-testid={`edit-btn-${pub.id}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => handleDelete(pub.id)}
                      data-testid={`delete-btn-${pub.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="absolute top-2 left-2">
                  {pub.file_type === 'video' ? (
                    <Badge variant="secondary" className="gap-1">
                      <Video className="w-3 h-3" />
                      Video
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="gap-1">
                      <ImageIcon className="w-3 h-3" />
                      Imagen
                    </Badge>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <Badge className={statusColors[pub.status]}>
                    {statusLabels[pub.status]}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium truncate">{pub.title}</h3>
                {pub.description && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {pub.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(pub.created_at).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Publicación</DialogTitle>
          </DialogHeader>
          {selectedPub && (
            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Título</Label>
                <Input
                  id="edit-title"
                  value={selectedPub.title}
                  onChange={(e) => setSelectedPub({ ...selectedPub, title: e.target.value })}
                  required
                  data-testid="edit-title-input"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Descripción</Label>
                <Textarea
                  id="edit-description"
                  value={selectedPub.description || ''}
                  onChange={(e) => setSelectedPub({ ...selectedPub, description: e.target.value })}
                  rows={3}
                  data-testid="edit-description-input"
                />
              </div>
              <Button type="submit" className="w-full" data-testid="edit-submit-btn">
                Guardar Cambios
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
          {selectedPub && (
            <div>
              <div className="relative aspect-video bg-black">
                {selectedPub.file_type === 'video' ? (
                  <video
                    src={getFileUrl(selectedPub.storage_path)}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={getFileUrl(selectedPub.storage_path)}
                    alt={selectedPub.title}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-bold">{selectedPub.title}</h2>
                {selectedPub.description && (
                  <p className="text-muted-foreground mt-2">{selectedPub.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
