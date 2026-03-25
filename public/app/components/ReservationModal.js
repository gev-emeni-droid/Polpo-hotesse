import React, { useState, useEffect, useMemo } from 'react';

const InputField = ({ id, label, className, ...props }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input id={id} {...props} className="bg-white block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-white disabled:cursor-not-allowed" />
    </div>
);

const SelectField = ({ id, label, options, className, ...props }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select id={id} {...props} className="bg-white block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-white disabled:cursor-not-allowed">
            <option value="">--</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
    </div>
);

const formatCurrency = (value) => {
    const num = Number(String(value || '0').replace(',', '.'));
    return isFinite(num) ? num.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }) : '0,00 €';
};

const ReservationModal = ({ reservation, onSave, onClose, isArchived, priseParOptions, encaisserParOptions }) => {
  const [formData, setFormData] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    return {
      nom: '', prenom: '', tel: '', heure: '20:00',
      creation: today, paiement: today, comment: '',
      ad: 2, enf: 0, tarifad: 98, tarifenf: 49,
      prisepar: priseParOptions[0] || '', encaisserpar: encaisserParOptions[0] || '',
      cb: 0, amex: 0, espece: 0, cheque: 0, zen: 0, virm: 0,
    };
  });

  useEffect(() => {
    if (reservation) {
      setFormData(reservation);
    }
  }, [reservation]);

  const handleChange = (e) => {
    const { id, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: (type === 'number') ? parseFloat(value) || 0 : value,
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isArchived) return;
    const id = reservation ? reservation.id : `res_${Date.now()}_${Math.random()}`;
    onSave({ ...formData, id });
    onClose();
  };

  const { total, paye, reste } = useMemo(() => {
    const total = formData.ad * formData.tarifad + formData.enf * formData.tarifenf;
    const paye = formData.cb + formData.amex + formData.espece + formData.cheque + formData.zen + formData.virm;
    return { total, paye, reste: total - paye };
  }, [formData]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 backdrop">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col modal" role="dialog" aria-modal="true">
        <header className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">{reservation ? 'Modifier la réservation' : 'Nouvelle réservation'}</h3>
          <button onClick={onClose} className="text-2xl leading-none">&times;</button>
        </header>

        <div className="p-6 overflow-y-auto content">
            <form id="resa-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <InputField id="nom" label="Nom" value={formData.nom} onChange={handleChange} disabled={isArchived} className="md:col-span-1" />
                    <InputField id="prenom" label="Prénom" value={formData.prenom} onChange={handleChange} disabled={isArchived} className="md:col-span-1" />
                    <InputField id="tel" label="Téléphone" value={formData.tel} onChange={handleChange} disabled={isArchived} className="md:col-span-1" />
                    <InputField id="heure" label="Heure" type="time" value={formData.heure} onChange={handleChange} disabled={isArchived} className="md:col-span-1" />
                    <InputField id="creation" label="Date de création" type="date" value={formData.creation} onChange={handleChange} required disabled={isArchived} className="md:col-span-2"/>
                    <InputField id="paiement" label="Date de paiement" type="date" value={formData.paiement} onChange={handleChange} required disabled={isArchived} className="md:col-span-2"/>
                    
                    <div className="md:col-span-4">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Commentaire</label>
                        <textarea id="comment" value={formData.comment} onChange={handleChange} rows={3} className="bg-white mt-1 block w-full rounded-md border-gray-300 shadow-sm disabled:bg-white disabled:cursor-not-allowed" disabled={isArchived}></textarea>
                    </div>

                    <InputField id="ad" label="Adultes" type="number" min="0" value={formData.ad} onChange={handleChange} disabled={isArchived} />
                    <InputField id="enf" label="Enfants" type="number" min="0" value={formData.enf} onChange={handleChange} disabled={isArchived} />
                    <InputField id="tarifad" label="Tarif AD." type="number" step="0.01" value={formData.tarifad} onChange={handleChange} disabled={isArchived} />
                    <InputField id="tarifenf" label="Tarif ENF." type="number" step="0.01" value={formData.tarifenf} onChange={handleChange} disabled={isArchived} />
                    
                    <SelectField id="prisepar" label="Prise par" value={formData.prisepar} options={priseParOptions} onChange={handleChange} disabled={isArchived} className="md:col-span-2" />
                    <SelectField id="encaisserpar" label="Encaisser par" value={formData.encaisserpar} options={encaisserParOptions} onChange={handleChange} disabled={isArchived} className="md:col-span-2" />
                    
                    <div className="md:col-span-4 grid grid-cols-2 md:grid-cols-6 gap-4 border-t pt-4 mt-2">
                        <InputField id="cb" label="CB (€)" type="number" step="0.01" value={formData.cb} onChange={handleChange} disabled={isArchived} />
                        <InputField id="amex" label="AMEX (€)" type="number" step="0.01" value={formData.amex} onChange={handleChange} disabled={isArchived} />
                        <InputField id="espece" label="ESPECE (€)" type="number" step="0.01" value={formData.espece} onChange={handleChange} disabled={isArchived} />
                        <InputField id="cheque" label="CHEQUE (€)" type="number" step="0.01" value={formData.cheque} onChange={handleChange} disabled={isArchived} />
                        <InputField id="zen" label="ZEN (€)" type="number" step="0.01" value={formData.zen} onChange={handleChange} disabled={isArchived} />
                        <InputField id="virm" label="VIRM (€)" type="number" step="0.01" value={formData.virm} onChange={handleChange} disabled={isArchived} />
                    </div>

                    <div className="md:col-span-4 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg flex flex-wrap gap-x-4 gap-y-2 justify-around text-sm md:text-base">
                        <span className="font-semibold">Total: <span className="text-blue-800">{formatCurrency(total)}</span></span>
                        <span className="font-semibold">Payé: <span className="text-green-800">{formatCurrency(paye)}</span></span>
                        <span className="font-semibold">Reste: <span className={reste > 0 ? 'text-red-800' : 'text-green-800'}>{formatCurrency(reste)}</span></span>
                    </div>
                </div>
            </form>
        </div>

        <footer className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">{isArchived ? "Fermer" : "Annuler"}</button>
          {!isArchived && <button type="submit" form="resa-form" className="px-4 py-2 bg-[#163667] text-white rounded-md hover:bg-opacity-90">Enregistrer</button>}
        </footer>
      </div>
    </div>
  );
};

export default ReservationModal;
