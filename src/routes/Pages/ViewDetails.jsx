import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const ViewDetails = () => {
  const navigate = useNavigate()
  const { state } = useLocation();
  const items = state?.items || [];
    const title = state?.heading?.title || 'Default Title';

  // Function to calculate minutes left until exit time
  const getTimeLeft = (entryDate, exitTime) => {
    const now = new Date();
    const exitDateTime = new Date(`${entryDate}T${exitTime}`);
    const diffInMinutes = Math.round((exitDateTime - now) / 60000);
    return diffInMinutes <= 0 ? 'Completed' : `${diffInMinutes} min left`;
  };

  return (
    <div className="p-6 min-h-screen text-gray-900">
      <h3 className="mb-6 flex items-center gap-2 text-lg font-medium cursor-pointer" onClick={()=>navigate('/dashboard')}>
  <ArrowLeft className="w-5 h-5" />
   <span>  Back to Dashboard</span>
</h3>
      <h1 className="text-3xl font-bold mb-8">{ title } List</h1>

      <div className="overflow-x-auto rounded-xl shadow border border-gray-200 bg-white">
        <table className="min-w-full table-auto">
          <thead className="bg-[#F3F4F6] text-gray-600 text-sm uppercase">
            <tr>
              <th className="px-6 py-4 text-left">#</th>
              <th className="px-6 py-4 text-left">Kid Name</th>
                <th className="px-6 py-4 text-left">Kid gender</th>
              <th className="px-6 py-4 text-left">Parent Name</th>
              <th className="px-6 py-4 text-left">Package</th>
              <th className="px-6 py-4 text-left">Entry Time</th>
              <th className="px-6 py-4 text-left">Exit Time</th>
              <th className="px-6 py-4 text-left">Time Left</th> {/* New column */}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No customer data available.
                </td>
              </tr>
            ) : (
              items
                .sort((a, b) => {
                  const now = new Date();
                  const aExit = new Date(`${a.entrydate}T${a.exittime}`);
                  const bExit = new Date(`${b.entrydate}T${b.exittime}`);
                  return (aExit - now) - (bExit - now); // Ascending by time left
                })
                .map((item, index) => (
                  <tr
                    key={item.id || index}
                    className="border-t border-gray-200 hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4 font-medium">{item.kidname}</td>
                          <td className="px-6 py-4 font-medium">{item.gender}</td>
                    <td className="px-6 py-4">{item.parentname}</td>
                    <td className="px-6 py-4">{item.packagename}</td>
                    <td className="px-6 py-4">{`${item.entrydate} ${item.entrytime || ''}`}</td>
                    <td className="px-6 py-4">{`${item.entrydate} ${item.exittime}`}</td>
                    <td className="px-6 py-4 font-medium">
                      {getTimeLeft(item.entrydate, item.exittime)}
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewDetails;
