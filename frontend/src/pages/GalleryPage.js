import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Image as ImageIcon, Video, User } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function GalleryPage() {
  const { user } = useAuth();
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublications();
  }, []);

  const fetchPublications = async () => {
    try {
      const { data } = await axios.get(`${API}/api/files`);

      const formatted = data.map((file, index) => ({
        id: index,
        title: file.name,
        user_name: "Usuario",
        file_type: file.name.match(/\.(mp4|webm|mov)$/) ? "video" : "image",
        storage_path: file.name,
      }));

      setPublications(formatted);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (path) => `${API}/uploads/${path}`;

  const getBentoClass = (index) => {
    const patterns = [
      'col-span-1 row-span-1',
      'col-span-2 row-span-2',
      'col-span-1 row-span-2',
      'col-span-1 row-span-1',
    ];
    return patterns[index % patterns.length];
  };

  return (
    <div className="min-h-screen p-6">

      <h1 className="text-4xl font-bold mb-6 text-center">
        Galería de Publicaciones
      </h1>

      {loading ? (
        <p className="text-center">Cargando...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          {publications.map((pub, index) => (
            <Card
              key={pub.id}
              className={`overflow-hidden group cursor-pointer ${getBentoClass(index)}`}
            >
              <div className="relative w-full h-full">

                {/* Imagen o video */}
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
                  />
                )}

                {/* Overlay bonito */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition">

                  <div className="absolute bottom-0 p-3 text-white">
                    <p className="text-sm font-bold truncate">{pub.title}</p>

                    <div className="flex items-center gap-1 text-xs opacity-80">
                      <User className="w-3 h-3" />
                      Usuario
                    </div>
                  </div>
                </div>

                {/* Badge */}
                <div className="absolute top-2 left-2">
                  <Badge className="bg-black/50 text-white border-0">
                    {pub.file_type === 'video' ? (
                      <Video className="w-3 h-3" />
                    ) : (
                      <ImageIcon className="w-3 h-3" />
                    )}
                  </Badge>
                </div>

              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
  );
}
