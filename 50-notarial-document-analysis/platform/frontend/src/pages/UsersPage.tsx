import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield, User, KeyRound, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '../components/ui/dialog';
import { usersApi } from '../lib/api';
import { useToast } from '../components/ui/toast';

interface UserType {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
}

const MOCK_MODE = true;

const mockUsers: UserType[] = [
  {
    id: '1',
    fullName: 'Administrador',
    email: 'admin@exemplo.com',
    role: 'admin',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    fullName: 'João Silva',
    email: 'joao@plataforma.com.br',
    role: 'user',
    createdAt: '2024-02-10T14:30:00Z',
  },
  {
    id: '3',
    fullName: 'Maria Santos',
    email: 'maria@plataforma.com.br',
    role: 'user',
    createdAt: '2024-02-15T09:20:00Z',
  },
  {
    id: '4',
    fullName: 'Pedro Costa',
    email: 'pedro@plataforma.com.br',
    role: 'admin',
    createdAt: '2024-03-01T16:45:00Z',
  },
  {
    id: '5',
    fullName: 'Ana Oliveira',
    email: 'ana@plataforma.com.br',
    role: 'user',
    createdAt: '2024-03-10T11:15:00Z',
  },
];

export default function UsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'reset'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user',
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      if (MOCK_MODE) {
        await new Promise(resolve => setTimeout(resolve, 300));
        setUsers(mockUsers);
      } else {
        const response = await usersApi.getAll();
        if (response.data) {
          setUsers(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      showToast('error', 'Erro ao carregar', 'Não foi possível carregar os usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (mode: 'create' | 'edit' | 'reset', user?: UserType) => {
    setDialogMode(mode);
    if (user) {
      setEditingId(user.id);
      if (mode === 'edit') {
        setForm({
          fullName: user.fullName,
          email: user.email,
          password: '',
          role: user.role,
        });
      } else if (mode === 'reset') {
        setForm({
          fullName: user.fullName,
          email: user.email,
          password: '',
          role: user.role,
        });
      }
    } else {
      setEditingId(null);
      setForm({
        fullName: '',
        email: '',
        password: '',
        role: 'user',
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (dialogMode === 'create') {
        const response = await usersApi.create({
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          role: form.role,
        });
        if (response.error) {
          showToast('error', 'Erro ao criar usuário', response.error);
          return;
        }
        showToast('success', 'Usuário criado!', `${form.fullName} foi adicionado com sucesso`);
      } else if (dialogMode === 'edit' && editingId) {
        const response = await usersApi.update(editingId, {
          fullName: form.fullName,
          role: form.role,
        });
        if (response.error) {
          showToast('error', 'Erro ao editar usuário', response.error);
          return;
        }
        showToast('success', 'Usuário atualizado!', 'As informações foram salvas com sucesso');
      } else if (dialogMode === 'reset' && editingId) {
        const response = await usersApi.resetPassword(editingId, form.password);
        if (response.error) {
          showToast('error', 'Erro ao resetar senha', response.error);
          return;
        }
        showToast('success', 'Senha resetada!', 'A nova senha foi definida com sucesso');
      }

      setShowDialog(false);
      loadUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      showToast('error', 'Erro inesperado', 'Ocorreu um erro ao processar a solicitação');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) {
      return;
    }

    try {
      const response = await usersApi.delete(id);
      if (response.error) {
        showToast('error', 'Erro ao excluir', response.error);
        return;
      }
      showToast('success', 'Usuário excluído!', 'O usuário foi removido com sucesso');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showToast('error', 'Erro ao excluir', 'Não foi possível excluir o usuário');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Usuários
          </h2>
          <p className="text-muted-foreground mt-1">Gerencie os usuários do sistema</p>
        </div>
        <Button onClick={() => handleOpenDialog('create')}>
          <Plus className="w-5 h-5 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      user.role === 'admin'
                        ? 'bg-gradient-to-br from-secondary to-accent'
                        : 'bg-gradient-to-br from-primary to-accent'
                    }`}
                  >
                    {user.role === 'admin' ? (
                      <Shield className="w-6 h-6 text-white" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.fullName}</CardTitle>
                    <CardDescription className="text-xs">
                      {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Criado em</p>
                  <p className="text-sm font-medium">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenDialog('edit', user)}
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog('reset', user)}
                  >
                    <KeyRound className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogClose onClick={() => setShowDialog(false)} />
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {dialogMode === 'create' && 'Novo Usuário'}
                {dialogMode === 'edit' && 'Editar Usuário'}
                {dialogMode === 'reset' && 'Resetar Senha'}
              </DialogTitle>
              <DialogDescription>
                {dialogMode === 'create' && 'Preencha os dados do novo usuário'}
                {dialogMode === 'edit' && 'Atualize as informações do usuário'}
                {dialogMode === 'reset' && 'Digite a nova senha para o usuário'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {dialogMode !== 'reset' && (
                <>
                  <div>
                    <Label htmlFor="fullName">Nome Completo</Label>
                    <Input
                      id="fullName"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder="Ex: João Silva"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="usuario@email.com"
                      required
                      disabled={dialogMode === 'edit'}
                    />
                  </div>

                  <div>
                    <Label htmlFor="role">Tipo de Usuário</Label>
                    <select
                      id="role"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'user' })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="user">Usuário</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                </>
              )}

              {(dialogMode === 'create' || dialogMode === 'reset') && (
                <div>
                  <Label htmlFor="password">
                    {dialogMode === 'create' ? 'Senha' : 'Nova Senha'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {dialogMode === 'create' && 'Criar Usuário'}
                {dialogMode === 'edit' && 'Salvar Alterações'}
                {dialogMode === 'reset' && 'Resetar Senha'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
