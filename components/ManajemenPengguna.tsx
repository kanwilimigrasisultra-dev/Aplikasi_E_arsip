import React, { useState, useEffect } from 'react';
import { User, UserRole, UnitKerja } from '../types';
import { PlusIcon, UsersIcon, PencilIcon, TrashIcon } from './icons';
import Modal from './Modal';

interface ManajemenPenggunaProps {
    users: User[];
    unitKerjaList: UnitKerja[];
    currentUser: User;
    onCreateUser: (user: Omit<User, 'id'>) => void;
    onUpdateUser: (user: Partial<User> & { id: string }) => void;
    onDeleteUser: (userId: string) => void;
}

const UserFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (user: Omit<User, 'id'> | (Partial<User> & { id: string })) => void;
    userToEdit?: User | null;
    unitKerjaList: UnitKerja[];
    currentUser: User;
}> = ({ isOpen, onClose, onSubmit, userToEdit, unitKerjaList, currentUser }) => {
    const [nama, setNama] = useState('');
    const [nip, setNip] = useState('');
    const [pangkatGolongan, setPangkatGolongan] = useState('');
    const [email, setEmail] = useState('');
    const [jabatan, setJabatan] = useState('');
    const [tanggalLahir, setTanggalLahir] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.STAF);
    const [unitKerjaId, setUnitKerjaId] = useState('');

    const isSuperAdmin = currentUser.role === UserRole.SUPER_ADMIN;

    const availableRoles = Object.values(UserRole).filter(r => {
        if (isSuperAdmin) return true;
        return r !== UserRole.SUPER_ADMIN && r !== UserRole.ADMIN;
    });

    useEffect(() => {
        if (userToEdit) {
            setNama(userToEdit.nama);
            setNip(userToEdit.nip);
            setPangkatGolongan(userToEdit.pangkatGolongan);
            setJabatan(userToEdit.jabatan);
            setEmail(userToEdit.email);
            setRole(userToEdit.role);
            setUnitKerjaId(userToEdit.unitKerjaId);
            setTanggalLahir(userToEdit.tanggalLahir ? new Date(userToEdit.tanggalLahir).toISOString().split('T')[0] : '');
        } else {
            setNama('');
            setNip('');
            setPangkatGolongan('');
            setJabatan('');
            setEmail('');
            setTanggalLahir('');
            setRole(UserRole.STAF);
            setUnitKerjaId(isSuperAdmin ? (unitKerjaList[0]?.id || '') : currentUser.unitKerjaId);
        }
        setPassword('');
    }, [userToEdit, isOpen, isSuperAdmin, currentUser.unitKerjaId, unitKerjaList]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const userData: any = { nama, nip, pangkatGolongan, jabatan, email, role, unitKerjaId, tanggalLahir };
        if (userToEdit) {
            if (password) {
                userData.password = password;
            }
            onSubmit({ ...userData, id: userToEdit.id });
        } else {
            userData.password = password;
            onSubmit(userData);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={userToEdit ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
                        <input type="text" value={nama} onChange={e => setNama(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">NIP</label>
                        <input type="text" value={nip} onChange={e => setNip(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Jabatan</label>
                        <input type="text" value={jabatan} onChange={e => setJabatan(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Pangkat/Golongan</label>
                        <input type="text" value={pangkatGolongan} onChange={e => setPangkatGolongan(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Tanggal Lahir</label>
                        <input type="date" value={tanggalLahir} onChange={e => setTanggalLahir(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Unit Kerja</label>
                        <select value={unitKerjaId} onChange={e => setUnitKerjaId(e.target.value)} required disabled={!isSuperAdmin} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-slate-200">
                            {isSuperAdmin ? ( unitKerjaList.map(u => <option key={u.id} value={u.id}>{u.nama}</option>) ) : ( <option value={currentUser.unitKerjaId}>{unitKerjaList.find(u => u.id === currentUser.unitKerjaId)?.nama}</option> )}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-slate-700">Peran (Role)</label>
                        <select value={role} onChange={e => setRole(e.target.value as UserRole)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                           {availableRoles.map(r => <option key={r as string} value={r as string}>{r}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!userToEdit} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder={userToEdit ? 'Kosongkan jika tidak ingin diubah' : ''} />
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Batal</button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">
                        {userToEdit ? 'Simpan Perubahan' : 'Simpan Pengguna'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
            <div className="space-y-4">
                <p className="text-sm text-slate-600">{message}</p>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Batal</button>
                    <button type="button" onClick={onConfirm} className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                        Hapus
                    </button>
                </div>
            </div>
        </Modal>
    );
};

const ManajemenPengguna: React.FC<ManajemenPenggunaProps> = ({ users, unitKerjaList, currentUser, onCreateUser, onUpdateUser, onDeleteUser }) => {
    const [isFormModalOpen, setFormModalOpen] = useState(false);
    const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<User | null>(null);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);

    const handleOpenAddModal = () => {
        setUserToEdit(null);
        setFormModalOpen(true);
    };

    const handleOpenEditModal = (user: User) => {
        setUserToEdit(user);
        setFormModalOpen(true);
    };

    const handleOpenDeleteModal = (userId: string) => {
        setUserToDelete(userId);
        setConfirmModalOpen(true);
    };
    
    const handleConfirmDelete = () => {
        if (userToDelete) {
            onDeleteUser(userToDelete);
            setConfirmModalOpen(false);
            setUserToDelete(null);
        }
    }

    const handleSubmitUser = (user: Omit<User, 'id'> | (Partial<User> & { id: string })) => {
        if ('id' in user) {
            onUpdateUser(user);
        } else {
            onCreateUser(user as Omit<User, 'id'>);
        }
    };

    const getRoleBadge = (role: UserRole) => {
        const colorMap: { [key in UserRole]: string } = {
            [UserRole.SUPER_ADMIN]: 'bg-red-100 text-red-800',
            [UserRole.ADMIN]: 'bg-amber-100 text-amber-800',
            [UserRole.PIMPINAN]: 'bg-sky-100 text-sky-800',
            [UserRole.MANAJERIAL]: 'bg-indigo-100 text-indigo-800',
            [UserRole.STAF]: 'bg-slate-100 text-slate-800',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorMap[role]}`}>{role}</span>;
    }

    return (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                    <div className="flex items-center">
                        <UsersIcon className="w-6 h-6 mr-3 text-slate-700" />
                        <h3 className="text-lg font-semibold text-slate-800">Daftar Pengguna Sistem</h3>
                    </div>
                    <button onClick={handleOpenAddModal} className="flex items-center bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Tambah Pengguna
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                            <tr>
                                <th scope="col" className="px-6 py-3">Nama Lengkap</th>
                                <th scope="col" className="px-6 py-3">Jabatan</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3">Unit Kerja</th>
                                <th scope="col" className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{user.nama}</td>
                                    <td className="px-6 py-4">{user.jabatan}</td>
                                    <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                                    <td className="px-6 py-4">{unitKerjaList.find(u => u.id === user.unitKerjaId)?.nama || 'N/A'}</td>
                                    <td className="px-6 py-4 space-x-4">
                                        <button onClick={() => handleOpenEditModal(user)} className="font-medium text-blue-600 hover:text-blue-800 transition-colors">
                                            <PencilIcon className="w-5 h-5 inline-block"/>
                                        </button>
                                        <button onClick={() => handleOpenDeleteModal(user.id)} className="font-medium text-red-600 hover:text-red-800 transition-colors disabled:text-slate-400 disabled:cursor-not-allowed" disabled={user.id === currentUser.id}>
                                            <TrashIcon className="w-5 h-5 inline-block"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <UserFormModal
                isOpen={isFormModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSubmit={handleSubmitUser}
                userToEdit={userToEdit}
                unitKerjaList={unitKerjaList}
                currentUser={currentUser}
            />

            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Konfirmasi Hapus"
                message={`Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.`}
            />
        </div>
    );
};

export default ManajemenPengguna;