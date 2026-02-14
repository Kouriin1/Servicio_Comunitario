import Modal from './Modal';
import Button from './Button';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title = 'Confirmar', message }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="text-center space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
        <div className="flex gap-3 pt-2">
          <Button
            variant="ghost"
            className="flex-1 py-3 bg-slate-100 dark:bg-slate-700 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white"
            onClick={() => { onConfirm(); onClose(); }}
          >
            Eliminar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
