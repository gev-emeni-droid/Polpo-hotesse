import React, { useState, useEffect, useMemo } from 'react';

const InputField = ({ id, label, className, ...props }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
          id={id}
          {...props}
          className="bg-white block w-full rounded-xl border border-slate-300 shadow-sm focus:border-[#163667] focus:ring-[#163667] sm:text-sm disabled:bg-white disabled:cursor-not-allowed px-3 py-2"
        />
    </div>
);

const SelectField = ({ id, label, options, className, ...props }) => (
    <div className={className}>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <select
          id={id}
          {...props}
          className="bg-white block w-full rounded-xl border border-slate-300 shadow-sm focus:border-[#163667] focus:ring-[#163667] sm:text-sm disabled:bg-white disabled:cursor-not-allowed px-3 py-2"
        >
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
      [id]: (type === 'number') ? (value === '' ? '' : parseFloat(value)) : value,
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
    const toNum = (v) => {
      const n = Number(v);
      return isFinite(n) ? n : 0;
    };
    const total = toNum(formData.ad) * toNum(formData.tarifad) + toNum(formData.enf) * toNum(formData.tarifenf);
    const paye = toNum(formData.cb) + toNum(formData.amex) + toNum(formData.espece) + toNum(formData.cheque) + toNum(formData.zen) + toNum(formData.virm);
    return { total, paye, reste: total - paye };
  }, [formData]);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4 backdrop">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col modal" role="dialog" aria-modal="true">
        <header className="px-6 py-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-extrabold text-[#0b132b]">{reservation ? 'Modifier la réservation' : 'Nouvelle réservation'}</h3>
          <button onClick={onClose} aria-label="Fermer" className="h-10 w-10 rounded-xl bg-[#163667] text-white text-lg grid place-items-center">✕</button>
        </header>

        <div className="p-6 overflow-y-auto content">
            <form id="resa-form" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    {/* Ligne 1 */}
                    <InputField id="nom" label="Nom" value={formData.nom} onChange={handleChange} disabled={isArchived} className="md:col-span-3" />
                    <InputField id="prenom" label="Prénom" value={formData.prenom} onChange={handleChange} disabled={isArchived} className="md:col-span-3" />
                    <InputField id="tel" label="Téléphone" value={formData.tel} onChange={handleChange} disabled={isArchived} className="md:col-span-3" />
                    <InputField id="heure" label="Heure" type="time" value={formData.heure} onChange={handleChange} disabled={isArchived} className="md:col-span-3" />

                    {/* Ligne 2 + commentaire à droite sur 2 rangées */}
                    <InputField id="creation" label="Date de création" type="date" value={formData.creation} onChange={handleChange} required disabled={isArchived} className="md:col-span-3"/>
                    <InputField id="paiement" label="Date de paiement" type="date" value={formData.paiement} onChange={handleChange} required disabled={isArchived} className="md:col-span-3"/>
                    <div className="md:col-span-6 md:row-span-2">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Commentaire</label>
                        <textarea id="comment" value={formData.comment} onChange={handleChange} rows={5} className="bg-white mt-1 block w-full rounded-xl border border-slate-300 shadow-sm focus:border-[#163667] focus:ring-[#163667] disabled:bg-white disabled:cursor-not-allowed px-3 py-2 h-full" disabled={isArchived}></textarea>
                    </div>

                    {/* Ligne 3 */}
                    <InputField id="ad" label="Adultes" type="number" min="0" value={formData.ad} onChange={handleChange} disabled={isArchived} className="md:col-span-2" />
                    <InputField id="enf" label="Enfants" type="number" min="0" value={formData.enf} onChange={handleChange} disabled={isArchived} className="md:col-span-2" />
                    <InputField id="tarifad" label="Tarif AD." type="number" step="0.01" value={formData.tarifad} onChange={handleChange} disabled={isArchived} className="md:col-span-2" />
                    <InputField id="tarifenf" label="Tarif ENF." type="number" step="0.01" value={formData.tarifenf} onChange={handleChange} disabled={isArchived} className="md:col-span-2" />
                    <SelectField id="prisepar" label="Prise par" value={formData.prisepar} options={priseParOptions} onChange={handleChange} disabled={isArchived} className="md:col-span-2" />
                    <SelectField id="encaisserpar" label="Encaisser par" value={formData.encaisserpar} options={encaisserParOptions} onChange={handleChange} disabled={isArchived} className="md:col-span-2" />

                    {/* Ligne 4 montants (6 champs) */}
                    <div className="md:col-span-12 grid grid-cols-2 md:grid-cols-12 gap-4 border-t pt-4 mt-2">
                        <InputField id="cb" label="CB (€)" type="number" step="0.01" value={formData.cb} onChange={handleChange} disabled={isArchived} className="md:col-span-2" />
                        <InputField id="amex" label="AMEX (€)" type="number" step="0.01" value={formData.amex} onChange={handleChange} disabled={isArchived} className="md:col-span-2" />
                        <InputField id="espece" label="ESPECE (€)" type="number" step="0.01" value={formData.espece} onChange={handleChange} disabled={isArchived} className="md:col-span-2" />
                        <InputField id="cheque" label="CHEQUE (€)" type="number" step="0.01" value={formData.cheque} onChange={handleChange} disabled={isArchived} className="md:col-span-2" />
                        <InputField id="zen" label="ZEN (€)" type="number" step="0.01" value={formData.zen} onChange={handleChange} disabled={isArchived} className="md:col-span-2" />
                        <InputField id="virm" label="VIRM (€)" type="number" step="0.01" value={formData.virm} onChange={handleChange} disabled={isArchived} className="md:col-span-2" />
                    </div>

                    <div className="md:col-span-12 mt-2 p-3 rounded-xl flex flex-col md:flex-row md:flex-nowrap items-center justify-center gap-2 md:gap-3 text-xs md:text-sm text-center" style={{ background:'#0b2a57', color:'#fff' }}>
                      <span className="font-bold whitespace-nowrap">Aperçu paiement :</span>
                      <span className="rounded-full px-3 py-1 whitespace-nowrap" style={{ background:'#163667' }}>Total acompte théorique : {formatCurrency(total)}</span>
                      <span className="rounded-full px-3 py-1 whitespace-nowrap" style={{ background:'#163667' }}>Total payé saisi : {formatCurrency(paye)}</span>
                      <span className="rounded-full px-3 py-1 font-bold whitespace-nowrap" style={{ background:'#fee2e2', color:'#b91c1c' }}>Reste à payer : {formatCurrency(reste)}</span>
                    </div>
                </div>
            </form>
        </div>

        <footer className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-5 py-2 rounded-xl bg-white border border-slate-300 text-[#163667] font-semibold hover:bg-slate-50">{isArchived ? "Fermer" : "Annuler"}</button>
          {!isArchived && <button type="submit" form="resa-form" className="px-5 py-2 rounded-xl bg-[#163667] text-white font-semibold hover:bg-opacity-90">Enregistrer</button>}
        </footer>
      </div>
    </div>
  );
};

export default ReservationModal;
