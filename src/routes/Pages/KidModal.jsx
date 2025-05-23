import React from 'react';
import boyimg from '../../assets/boyimg.png';
import girlimg from '../../assets/boyimg.png';

const KidModal = ({ kid, onClose }) => {
  if (!kid) return null;

  const calculateTimeLeft = () => {
    const now = new Date();
    const exitTime = new Date(`${kid.entrydate}T${kid.exittime}`);
    const diffInMinutes = Math.round((exitTime - now) / 60000);
    return diffInMinutes <= 0 ? 'Completed' : `${diffInMinutes} min left`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 shadow-xl max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-black text-2xl font-bold"
        >
          &times;
        </button>
        <div className="flex flex-col items-center text-center">
          <img
            src={kid.gender === 'Male' ? boyimg : girlimg}
            alt="Kid"
            className="w-24 h-24 rounded-full mb-4"
          />
          <h3 className="text-xl font-semibold mb-2">{kid.kidname}</h3>
          <p className="text-gray-600"><strong>Parent:</strong> {kid.parentname}</p>
          <p className="text-gray-600"><strong>Package:</strong> {kid.packagename}</p>
          <p className="text-gray-600"><strong>Entry:</strong> {kid.entrytime}</p>
          <p className="text-gray-600"><strong>Exit:</strong> {kid.exittime}</p>
          <p className="text-gray-800 font-medium mt-2"><strong>Time Left:</strong> {calculateTimeLeft()}</p>
        </div>
      </div>
    </div>
  );
};

export default KidModal;
