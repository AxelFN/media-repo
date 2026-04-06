import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { 
  Users, Image as ImageIcon, Video, Clock, CheckCircle, XCircle,
  Search, Trash2, Edit2, Eye, Shield, TrendingUp
} from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

function formatApiErrorDetail(detail) {
  if (detail == null) return "Algo salió mal. Intenta de nuevo.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedPub, setSelectedPub] = useState(null);

  const token = localStorage.getItem('access_token');
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, pubsRes] = await Promise.all([
        axios.get(`${API}/api/admin/stats`, { withCredentials: true, headers: authHeaders }),
        axios.get(`${API}/api/admin/users`, { withCredentials: true, headers: authHeaders }),
        axios.get(`${API}/api/admin/publications`, { withCredentials: true, headers: authHeaders })
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setPublications(pubsRes.data);
    } catch (e) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserRole = async () => {
    try {
      await axios.put(`${API}/api/admin/users/${selectedUser.id}`, {
        role: selectedUser.role,
        is_active: selectedUser.is_active
      }, { withCredentials: true, headers: authHeaders });
      toast.success('Usuario actualizado');
      setEditUserOpen(false);
      fetchData();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || 'Error al actualizar');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
    try {
      await axios.delete(`${API}/api/admin/users/${userId}`, { withCredentials: true, headers: authHeaders });
      toast.success('Usuario eliminado');
      fetchData();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || 'Error al eliminar');
    }
  };

  const handleUpdatePublicationStatus = async (pubId, status) => {
    try {
      await axios.put(`${API}/api/admin/publications/${pubId}/status?status=${status}`, {}, {
        withCredentials: true,
        headers: authHeaders
      });
      toast.success(`Publicación ${status === 'approved' ? 'aprobada' : 'rechazada'}`);
      fetchData();
    } catch (e) {
      toast.error(formatApiErrorDetail(e.response?.data?.detail) || 'Error al actualizar');
    }
  };

  const getFileUrl = (path) => {
    const tokenParam = token ? `?auth=${token}` : '';
    return `${API}/api/files/${path}${tokenParam}`;
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPublications = publications.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8" data-testid="admin-dashboard">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
          <p className="text-muted-foreground">Gestiona usuarios y publicaciones</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="animate-fade-in stagger-1" data-testid="stat-users">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Usuarios Totales</p>
                <p className="text-3xl font-bold">{stats?.users?.total || 0}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  {stats?.users?.active || 0} activos
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in stagger-2" data-testid="stat-publications">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Publicaciones</p>
                <p className="text-3xl font-bold">{stats?.publications?.total || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.publications?.images || 0} imágenes, {stats?.publications?.videos || 0} videos
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in stagger-3" data-testid="stat-pending">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendientes</p>
                <p className="text-3xl font-bold">{stats?.publications?.pending || 0}</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                  Requieren revisión
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in stagger-4" data-testid="stat-recent">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Esta Semana</p>
                <p className="text-3xl font-bold">{stats?.publications?.recent_week || 0}</p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  Nuevas publicaciones
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="publications" className="space-y-6">
        <TabsList>
          <TabsTrigger value="publications" data-testid="tab-publications">
            Publicaciones ({publications.length})
          </TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">
            Usuarios ({users.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="publications" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar publicaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-publications"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40" data-testid="filter-status">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="approved">Aprobados</SelectItem>
                <SelectItem value="rejected">Rechazados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPublications.map((pub) => (
              <Card key={pub.id} className="overflow-hidden group" data-testid={`admin-pub-${pub.id}`}>
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
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1688516353448-2351953b4b76?w=400&h=300&fit=crop';
                      }}
                    />
                  )}
                  <div className="absolute top-2 right-2">
                    <Badge className={statusColors[pub.status]}>
                      {statusLabels[pub.status]}
                    </Badge>
                  </div>
                  <div className="absolute top-2 left-2">
                    {pub.file_type === 'video' ? (
                      <Badge variant="secondary"><Video className="w-3 h-3 mr-1" />Video</Badge>
                    ) : (
                      <Badge variant="secondary"><ImageIcon className="w-3 h-3 mr-1" />Imagen</Badge>
                    )}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium truncate">{pub.title}</h3>
                  <p className="text-sm text-muted-foreground">Por: {pub.user_name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(pub.created_at).toLocaleDateString('es-ES')}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedPub(pub);
                        setPreviewOpen(true);
                      }}
                      data-testid={`admin-preview-${pub.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    {pub.status === 'pending' && (
                      <>
                        <Button 
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleUpdatePublicationStatus(pub.id, 'approved')}
                          data-testid={`admin-approve-${pub.id}`}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm"
                          variant="destructive"
                          onClick={() => handleUpdatePublicationStatus(pub.id, 'rejected')}
                          data-testid={`admin-reject-${pub.id}`}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPublications.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <p className="text-muted-foreground">No se encontraron publicaciones</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-md"
              data-testid="search-users"
            />
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium">Usuario</th>
                  <th className="px-4 py-3 text-left text-sm font-medium hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Rol</th>
                  <th className="px-4 py-3 text-left text-sm font-medium hidden sm:table-cell">Estado</th>
                  <th className="px-4 py-3 text-right text-sm font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((user) => (
                  <tr key={user.id || user.email} className="hover:bg-muted/30" data-testid={`user-row-${user.email}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-xs text-primary-foreground font-medium">
                            {user.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? 'Admin' : 'Usuario'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <Badge variant={user.is_active !== false ? 'outline' : 'destructive'}>
                        {user.is_active !== false ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => {
                            setSelectedUser({ ...user });
                            setEditUserOpen(true);
                          }}
                          data-testid={`edit-user-${user.email}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        {user.role !== 'admin' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteUser(user.id)}
                            data-testid={`delete-user-${user.email}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{selectedUser.email}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rol</label>
                <Select 
                  value={selectedUser.role} 
                  onValueChange={(v) => setSelectedUser({ ...selectedUser, role: v })}
                >
                  <SelectTrigger data-testid="edit-user-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Usuario</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select 
                  value={selectedUser.is_active !== false ? 'active' : 'inactive'} 
                  onValueChange={(v) => setSelectedUser({ ...selectedUser, is_active: v === 'active' })}
                >
                  <SelectTrigger data-testid="edit-user-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Activo</SelectItem>
                    <SelectItem value="inactive">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" onClick={handleUpdateUserRole} data-testid="save-user-btn">
                Guardar Cambios
              </Button>
            </div>
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
                <p className="text-sm text-muted-foreground">Por: {selectedPub.user_name}</p>
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
