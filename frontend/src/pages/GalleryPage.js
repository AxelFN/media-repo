import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { Image as ImageIcon, Video, User, Calendar, X } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Placeholder images
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

  useEffect(() => {
    fetchPublications();
  }, []);

  // 🔥 AHORA CONECTADO A TU BACKEND REAL
  const fetchPublications = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/api/files`);

      // Adaptamos datos al formato que tu UI espera
      const formatted = data.map((file, index) => ({
        id: index,
        title: file.name,
        user_name: "Usuario",
        file_type: file.name.match(/\.(mp4|webm|mov)$/) ? "video" : "image",
        storage_path: file.name,
        created_at: new Date().toISOString(),
      }));

      setPublications(formatted);
    } catch (e) {
      console.error('Error fetching publications:', e);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 URL CORRECTA PARA MOSTRAR ARCHIVOS
  const getFileUrl = (path) => {
    return `${API_URL}/uploads/${path}`;
  };

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
      
      {/* HERO */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold">
            Galería de <span className="text-primary">Publicaciones</span>
          </h1>

          {!user && (
            <div className="flex justify-center gap-4 mt-8">
              <Link to="/register">
                <Button size="lg">Empezar</Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">Login</Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* GALERÍA */}
      <section className="container mx-auto px-4 pb-16">
        {loading ? (
          <p>Cargando...</p>
        ) : publications.length === 0 ? (
          <p>No hay archivos aún</p>
        ) : (
          <>
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-bold">Archivos</h2>
              <Badge>{publications.length}</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {publications.map((pub, index) => (
                <Card
                  key={pub.id}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedPub(pub);
                    setPreviewOpen(true);
                  }}
                >
                  {pub.file_type === 'video' ? (
                    <video
                      src={getFileUrl(pub.storage_path)}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <img
                      src={getFileUrl(pub.storage_path)}
                      className="w-full h-40 object-cover"
                      onError={(e) => {
                        e.target.src = placeholderImages[index % placeholderImages.length];
                      }}
                    />
                  )}
                </Card>
              ))}
            </div>
          </>
        )}
      </section>

      {/* PREVIEW */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="p-0 bg-black">
          {selectedPub && (
            <div className="relative">
              <Button
                className="absolute top-2 right-2"
                onClick={() => setPreviewOpen(false)}
              >
                <X />
              </Button>

              {selectedPub.file_type === 'video' ? (
                <video
                  src={getFileUrl(selectedPub.storage_path)}
                  controls
                  className="w-full"
                />
              ) : (
                <img
                  src={getFileUrl(selectedPub.storage_path)}
                  className="w-full"
                />
              )}

              <div className="p-4 bg-white">
                <h2>{selectedPub.title}</h2>
                <p>{selectedPub.user_name}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
