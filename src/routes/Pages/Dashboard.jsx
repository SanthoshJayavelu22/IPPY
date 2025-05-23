import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import bglayout from '../../assets/Untitled design (5) 2.png';
import boyimg from '../../assets/boyimg.png';
import girlimg from '../../assets/Group 1302.png'
import KidModal from "./KidModal";

const DashboardPage = () => {
    const navigate = useNavigate();
    const [categorizedData, setCategorizedData] = useState({
        '0-15 min Remaining': [],
        '15-30 min Remaining': [],
        '30-60 min Remaining': []
    });
    const [removedIds, setRemovedIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);



    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`http://192.168.1.9:8080/GetCurrentCustomers`);
                const data = response.data;
                const now = new Date();
                const today = now.toISOString().split('T')[0];

                const categorized = {
                    '0-15 min Remaining': [],
                    '15-30 min Remaining': [],
                    '30-60 min Remaining': []
                };

                data.forEach(item => {
                    if (item.entrydate !== today) return;

                    const exitTimeStr = `${item.entrydate}T${item.exittime}`;
                    const exitTime = new Date(exitTimeStr);
                    const diffInMs = exitTime - now;
                    const diffInMinutes = diffInMs / 60000;

                    if (diffInMinutes <= 15) {
                        categorized['0-15 min Remaining'].push(item);
                    } else if (diffInMinutes > 15 && diffInMinutes <= 30) {
                        categorized['15-30 min Remaining'].push(item);
                    } else if (diffInMinutes > 30 && diffInMinutes <= 60) {
                        categorized['30-60 min Remaining'].push(item);
                    }
                });

                setCategorizedData(categorized);
            } catch (err) {
                setError(err.message);
                console.error('Error fetching customers:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    const handleRemove = (id) => {
        setRemovedIds((prev) => [...prev, id]);

        axios.post(`http://192.168.1.9:8080/UpdateStatus/${id}`)
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="flex flex-col gap-y-6  min-h-screen p-6 text-gray-900">
            <div className="flex lg:flex-nowrap flex-wrap justify-between gap-6">
                {/* Left Card - New Entry */}
                <div className="bg-white rounded-xl shadow-md w-1/2 p-6 flex flex-col">
                    <div className="flex items-center gap-3">
                        <h3 className="text-2xl font-semibold">New Entry</h3>
                    </div>
                    <p className="text-gray-700 my-4">Enter details for a new play session.</p>
                    <button 
                        className="bg-[#3F8CFF] hover:bg-blue-600 transition text-white rounded-md py-2 px-6 w-fit mb-6"
                        onClick={() => navigate('/new-entry')}
                    >
                        + New Entry
                    </button>
                    <div className="mt-auto">
                        <img src={bglayout} alt="Background layout" className="w-full" />
                    </div>
                </div>

                {/* Right Card - 0–15 min */}
                <TimeCard
                    title="0 - 15 min Remaining"
                    timeColor="text-blue-600"
                    items={categorizedData['0-15 min Remaining']}
                    removable={true}
                    removedIds={removedIds}
                    onRemove={handleRemove}
                />
            </div>

            {/* Bottom Cards Row */}
            <div className="flex lg:flex-nowrap flex-wrap justify-between gap-6">
                <TimeCard
                    title="15 - 30 min Remaining"
                    timeColor="text-[#E19E00]"
                    items={categorizedData['15-30 min Remaining']}
                />
                <TimeCard
                    title="30 - 60 min Remaining"
                    timeColor="text-[#05B20D]"
                    items={categorizedData['30-60 min Remaining']}
                />
            </div>
           

        </div>
    );
};

const TimeCard = ({ title, timeColor, items = [],  removable = false, removedIds = [], onRemove = () => {} }) => {
        const [selectedKid, setSelectedKid] = useState(null);
        let buttondisplay = false;
    const calculateTimeLeft = (exitTimeStr) => {

        const exitTime = new Date(exitTimeStr);
        const now = new Date();
        const diffInMs = exitTime - now;
        const diffInMinutes = Math.round(diffInMs / 60000);
        if(diffInMinutes <=0){
            buttondisplay = true
        }
        return diffInMinutes <=0 ? 'Completed' : `${diffInMinutes} min left`;
    };


        

   const navigate = useNavigate();

    const visibleItems = items.filter(item => !removedIds.includes(item.id));

    return (
        <div className="bg-white rounded-xl shadow-md lg:w-1/2 w-full p-6 flex flex-col">
            <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
  <h3 className="text-2xl font-semibold">{title}</h3>
  <span className="text-sm bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">
    {visibleItems.length} kid{visibleItems.length !== 1 ? 's' : ''}
  </span>
</div>
                <button className="text-[#3F8CFF] text-lg flex items-center gap-2 font-medium">
 <span onClick={() => navigate('/view-details', { 
  state: { 
    items: items,
    heading: { title: title }
  }
})}>
  View all
</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="33" height="23" viewBox="0 0 33 23" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M12.6551 7.63423C13.256 7.21001 14.2013 7.17738 14.8552 7.53633L15.0122 7.63423L21.6788 12.3415C22.2796 12.7657 22.3259 13.4332 21.8175 13.8949L21.6788 14.0058L15.0122 18.713C14.3613 19.1726 13.306 19.1726 12.6551 18.713C12.0543 18.2888 12.0081 17.6213 12.5165 17.1596L12.6551 17.0487L18.142 13.1736L12.6551 9.2985C12.0543 8.87428 12.0081 8.20675 12.5165 7.7451L12.6551 7.63423Z" fill="#3F8CFF"/>
                    </svg>
                </button>
            </div>

         <div className="flex flex-col gap-4 mt-4">
  {visibleItems
    .slice() // Create a copy to avoid mutating original array
    .sort((a, b) => {
      const now = new Date();
      const aExit = new Date(`${a.entrydate}T${a.exittime}`);
      const bExit = new Date(`${b.entrydate}T${b.exittime}`);
      return (aExit - now) - (bExit - now); // Ascending: less time first
    })
    .slice(0, 2) // Show top 2 entries
    .map((item, index) => (
      <div key={item.id || index} className="flex items-center justify-between border border-gray-200 rounded-lg p-4 shadow-sm bg-white">
        <img src={item.gender === 'Male' ? boyimg : girlimg} alt="Kid Avatar" className="w-14 h-14 rounded-full" />
        <InfoBlock title="Kid Name" value={item.kidname} />
        <InfoBlock title="Parent Name" value={item.parentname} />
        <InfoBlock title="Package" value={item.packagename} />
        <InfoBlock
          title="Time Left"
          value={calculateTimeLeft(`${item.entrydate}T${item.exittime}`)}
          valueClass={timeColor}
        />
        {buttondisplay === true && (
          <button
            onClick={() => onRemove(item.id)}
            className="bg-red-100 text-red-600 hover:bg-red-200 active:bg-red-300 transition-all text-sm px-3 py-1 rounded-md font-medium shadow-sm"
          >
            -
          </button>
        )}
      </div>
    ))}

{
   visibleItems.length === 0  && (<h2>0 kids in this time slot</h2>)
}
    
   </div>




       {visibleItems.length > 0 && (
  <div className="flex gap-3 items-center justify-center mt-6">
    {visibleItems.sort((a, b) => {
      const now = new Date();
      const aExit = new Date(`${a.entrydate}T${a.exittime}`);
      const bExit = new Date(`${b.entrydate}T${b.exittime}`);
      return (aExit - now) - (bExit - now); // Ascending: less time first
    }).slice(0, 10).map((item, index) => (
      <div key={index} className="relative group">
        <img
          src={item.gender === 'Male' ? boyimg : girlimg}
          alt=""
          className="w-10 h-10 rounded-full cursor-pointer"
            onClick={() => setSelectedKid(item)}
        />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
          {item.kidname}
        </div>
      </div>
    ))}


                                  
    {visibleItems.length > 10 && (
      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
        +{visibleItems.length - 10}
      </div>
    )}
  </div>
)}
 <KidModal kid={selectedKid} onClose={() => setSelectedKid(null)} />
        </div>
    );
};

const InfoBlock = ({ title, value, valueClass = "text-gray-800" }) => (
    <div className="text-center min-w-[100px]">
        <div className="text-sm text-gray-500">{title}</div>
        <div className={`font-semibold ${valueClass}`}>{value}</div>
    </div>
);

export default DashboardPage;
