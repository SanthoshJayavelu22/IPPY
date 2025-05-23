import React, { useState, useEffect } from 'react';
import axios from 'axios';
import boyimg from '../../assets/boyimg.png';
import girlimg from '../../assets/Group 1302.png'

const GetAllCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [mobileSearch, setMobileSearch] = useState('');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i); // Last 10 years
  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    name: new Date(2000, i, 1).toLocaleString('default', { month: 'long' }),
  }));

  // Function to convert 24-hour time to 12-hour format with AM/PM
  const formatTimeTo12Hour = (timeString) => {
    if (!timeString) return '';
    
    // Split the time string into hours and minutes
    const [hours, minutes] = timeString.split(':');
    const hourInt = parseInt(hours, 10);
    
    // Determine AM or PM
    const period = hourInt >= 12 ? 'PM' : 'AM';
    
    // Convert to 12-hour format
    const twelveHour = hourInt % 12 || 12;
    
    // Return formatted time
    return `${twelveHour}:${minutes} ${period}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://192.168.1.9:8080/GetAllCustomers');
        setCustomers(response.data);
        setFilteredCustomers(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...customers];

    if (selectedYear) {
      filtered = filtered.filter(customer =>
        new Date(customer.entrydate).getFullYear().toString() === selectedYear
      );
    }

    if (selectedMonth) {
      filtered = filtered.filter(customer =>
        (new Date(customer.entrydate).getMonth() + 1).toString() === selectedMonth
      );
    }

    if (mobileSearch.trim() !== '') {
      filtered = filtered.filter(customer =>
        customer.mobile.toLowerCase().includes(mobileSearch.trim().toLowerCase())
      );
    }

    setFilteredCustomers(filtered);
  }, [selectedYear, selectedMonth, mobileSearch, customers]);

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleMobileSearch = (e) => {
    setMobileSearch(e.target.value);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Customer Records</h1>

      {/* Filter Section */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select
              value={selectedYear}
              onChange={handleYearChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Years</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={handleMonthChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Months</option>
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.name}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Search by Mobile</label>
            <input
              type="text"
              value={mobileSearch}
              onChange={handleMobileSearch}
              placeholder="Enter mobile number"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kid</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visit Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={customer.gender === 'Male'
                            ? boyimg
                            : girlimg}
                          alt={customer.kidname}
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{customer.kidname}</div>
                          <div className="text-sm text-gray-500">{customer.gender}, {new Date(customer.dob).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.parentname}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.mobile}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {customer.packagename}
                      <div className="text-sm text-gray-500">Socks: {customer.sockspair} pair</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(customer.entrydate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTimeTo12Hour(customer.entrytime)} - {formatTimeTo12Hour(customer.exittime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{customer.totalamount}
                      {customer.discount > 0 && (
                        <div className="text-xs text-green-600">Discount: ₹{customer.discount}</div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No customers found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GetAllCustomers;