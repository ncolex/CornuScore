
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white/50 dark:bg-gray-800/50 py-4 mt-8">
      <div className="container mx-auto px-4 text-center text-xs text-gray-600 dark:text-gray-400">
        <p className="font-bold mb-1">Aviso Legal</p>
        <p>
          No publiques información que identifique de forma privada o infrinja la ley. 
          CornuScore no garantiza la veracidad de los reportes. Publicar información falsa o privada puede ser sancionado.
        </p>
        <p className="mt-2 text-pink-600">© 2024 CornuScore. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;