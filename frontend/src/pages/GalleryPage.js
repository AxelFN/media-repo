import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Image as ImageIcon, Video, User, Calendar, X } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

// Placeholder images from design guidelines
const placeholderImages = [
  'https://images.unsplash.com/photo-1670687811377-8b39b8644d1a?crop=entropy&cs=srgb&fm=jpg&w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1688516353448-2351953b4b76?crop=entropy&cs=srgb&fm=jpg&w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1751446561891-8c3bb0f16606?crop=entropy&cs=srgb&fm=jpg&w=800&h=600&fit=crop',
  'https://images.pexels.com/photos/8863914/pexels-photo-8863914.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
];

export default function GalleryPage() {
  const { user } = useAuth();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedPub, setSelectedPub] = useState(null);

  const token = localStorage.getItem('access_token');

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const { data } = await axios.get(`${API}/api/publications/approved`);
      setPublications(data);
    } catch (e) {
      console.error('Error fetching publications:', e);
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (path) => {
    return `${API}/api/files/${path}`;
  };

  // Create bento grid classes for visual interest
  const getBentoClass = (index) => {
    const patterns = [
      'col-span-1 row-span-1',
      'col-span-1 row-span-1',
      'col-span-2 row-span-2',
      'col-span-1 row-span-1',
      'col-span-1 row-span-2',
      'col-span-1 row-span-1',
    ];
    return patterns[index % patterns.length];
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]" data-testid="gallery-page">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 dark:from-primary/10 dark:to-primary/5" />
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight animate-fade-in">
            Galería de <span className="text-primary">Publicaciones</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground mt-4 max-w-2xl mx-auto animate-fade-in stagger-1">
            Explora las mejores imágenes y videos compartidos por nuestra comunidad
          </p>
          {!user && (
            <div className="flex justify-center gap-4 mt-8 animate-fade-in stagger-2">
              <Link to="/register">
                <Button size="lg" data-testid="hero-register-btn">
                  Empezar a Compartir
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" data-testid="hero-login-btn">
                  Iniciar Sesión
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="container mx-auto px-4 pb-16">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-square bg-muted" />
              </Card>
            ))}
          </div>
        ) : publications.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No hay publicaciones aún</h2>
            <p className="text-muted-foreground mb-6">
              Sé el primero en compartir contenido con la comunidad
            </p>
            {user ? (
              <Link to="/dashboard">
                <Button data-testid="empty-gallery-upload-btn">
                  Subir Primera Publicación
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button data-testid="empty-gallery-register-btn">
                  Regístrate para Compartir
                </Button>
              </Link>
            )}
            
            {/* Show placeholder gallery */}
            <div className="mt-12">
              <p className="text-sm text-muted-foreground mb-6">Vista previa del diseño de galería:</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {placeholderImages.map((img, i) => (
                  <Card key={i} className="overflow-hidden opacity-50 hover:opacity-75 transition-opacity">
                    <div className="aspect-square">
                      <img src={img} alt={`Placeholder ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Publicaciones Aprobadas</h2>
              <Badge variant="secondary">{publications.length} publicaciones</Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
              {publications.map((pub, index) => (
                <Card 
                  key={pub.id}
                  className={`overflow-hidden cursor-pointer group animate-fade-in ${getBentoClass(index)}`}
                  onClick={() => {
                    setSelectedPub(pub);
                    setPreviewOpen(true);
                  }}
                  data-testid={`gallery-item-${pub.id}`}
                >
                  <div className="relative w-full h-full">
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
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = placeholderImages[index % placeholderImages.length];
                        }}
                      />
                    )}
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-medium truncate">{pub.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <User className="w-3 h-3 text-white/70" />
                          <span className="text-white/70 text-sm">{pub.user_name}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Type Badge */}
                    <div className="absolute top-2 left-2">
                      {pub.file_type === 'video' ? (
                        <Badge variant="secondary" className="gap-1 bg-black/50 text-white border-0">
                          <Video className="w-3 h-3" />
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 bg-black/50 text-white border-0">
                          <ImageIcon className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="sm:max-w-4xl p-0 overflow-hidden bg-black/95">
          {selectedPub && (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
                onClick={() => setPreviewOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
              
              <div className="relative max-h-[80vh] flex items-center justify-center">
                {selectedPub.file_type === 'video' ? (
                  <video
                    src={getFileUrl(selectedPub.storage_path)}
                    controls
                    autoPlay
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                ) : (
                  <img
                    src={getFileUrl(selectedPub.storage_path)}
                    alt={selectedPub.title}
                    className="max-w-full max-h-[80vh] object-contain"
                  />
                )}
              </div>
              
              <div className="p-6 bg-background">
                <h2 className="text-xl font-bold">{selectedPub.title}</h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {selectedPub.user_name}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedPub.created_at).toLocaleDateString('es-ES', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </div>
                </div>
                {selectedPub.description && (
                  <p className="mt-4 text-muted-foreground">{selectedPub.description}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
