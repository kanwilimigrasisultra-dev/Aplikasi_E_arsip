import React, { useState, useEffect } from 'react';
import { PermintaanLaporan, UnitKerja } from '../types';
import Modal from './Modal';

interface PermintaanLaporanFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (permintaan: Omit<PermintaanLaporan, 'id'|'dibuatOleh'|'timestamp'>) => void;
    permintaanToEdit?: PermintaanLaporan | null;
    unitKerjaList: UnitKerja[];
}

const PermintaanLaporanFormModal: React.FC<PermintaanLaporanFormModalProps> = ({
    isOpen, onClose, onSubmit, permintaanToEdit, unitKerjaList
}) => {
    const getInitialState = () => ({
        nama: '',
        deskripsi: '',
        periode: 'Bulanan' as 'Bulanan' | 'Triwulan' | 'Tahunan',
        aturanJatuhTempo: '',
        unitTujuanIds: [] as string[],
    });

    const [formState, setFormState] = useState(getInitialState());

    useEffect(() => {
        if (permintaanToEdit) {
            setFormState({
                nama: permintaanToEdit.nama,
                deskripsi: permintaanToEdit.deskripsi,
                periode: permintaanToEdit.periode,
                aturanJatuhTempo: permintaanToEdit.aturanJatuhTempo,
                unitTujuanIds: permintaanToEdit.unitTujuanIds,
            });
        } else {
            setFormState(getInitialState());
        }
    }, [permintaanToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleUnitTujuanChange = (unitId: string) => {
        setFormState(prev => {
            const newUnitTujuanIds = prev.unitTujuanIds.includes(unitId)
                ? prev.unitTujuanIds.filter(id => id !== unitId)
                : [...prev.unitTujuanIds, unitId];
            return { ...prev, unitTujuanIds: newUnitTujuanIds };
        });
    };
    
    const handleSelectAllUnits = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setFormState(prev => ({...prev, unitTujuanIds: unitKerjaList.map(u => u.id)}));
        } else {
            setFormState(prev => ({...prev, unitTujuanIds: []}));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formState.nama.trim() && formState.aturanJatuhTempo.trim() && formState.unitTujuanIds.length > 0) {
            if (permintaanToEdit) {
                // onSubmit({ ...permintaanToEdit, ...formState });
            } else {
                onSubmit(formState);
            }
            onClose();
        } else {
            alert("Harap isi semua field yang wajib, termasuk memilih minimal satu unit tujuan.");
        }
    };

    const isAllUnitsSelected = formState.unitTujuanIds.length === unitKerjaList.length;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={permintaanToEdit ? 'Edit Permintaan Laporan' : 'Buat Permintaan Laporan Baru'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700">Nama Laporan</label>
                    <input type="text" name="nama" value={formState.nama} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Contoh: Laporan Keuangan Bulanan" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700">Deskripsi/Instruksi</label>
                    <textarea name="deskripsi" value={formState.deskripsi} onChange={handleChange} rows={3} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Jelaskan detail laporan yang diharapkan..."></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Periode</label>
                        <select name="periode" value={formState.periode} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
                            <option value="Bulanan">Bulanan</option>
                            <option value="Triwulan">Triwulan</option>
                            <option value="Tahunan">Tahunan</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Aturan Jatuh Tempo</label>
                        <input type="text" name="aturanJatuhTempo" value={formState.aturanJatuhTempo} onChange={handleChange} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md" placeholder="Contoh: Setiap tanggal 5 bulan berikutnya" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Unit Kerja Tujuan</label>
                    <div className="p-3 border rounded-md max-h-48 overflow-y-auto space-y-2">
                        <div className="flex items-center border-b pb-2">
                            <input 
                                id="select-all-units" 
                                type="checkbox"
                                checked={isAllUnitsSelected}
                                onChange={handleSelectAllUnits} 
                                className="h-4 w-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500" 
                            />
                            <label htmlFor="select-all-units" className="ml-2 block text-sm font-medium text-slate-800">Pilih Semua</label>
                        </div>
                        {unitKerjaList.map(unit => (
                            <div key={unit.id} className="flex items-center">
                                <input 
                                    id={`unit-${unit.id}`}
                                    type="checkbox" 
                                    checked={formState.unitTujuanIds.includes(unit.id)}
                                    onChange={() => handleUnitTujuanChange(unit.id)}
                                    className="h-4 w-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500"
                                />
                                <label htmlFor={`unit-${unit.id}`} className="ml-2 block text-sm text-gray-700">{unit.nama}</label>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end pt-4 space-x-2">
                    <button type="button" onClick={onClose} className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Batal</button>
                    <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800">
                        {permintaanToEdit ? 'Simpan Perubahan' : 'Buat Permintaan'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default PermintaanLaporanFormModal;
