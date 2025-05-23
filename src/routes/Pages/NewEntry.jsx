import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import axios from 'axios';
import { format, startOfToday, addHours, isAfter, isBefore } from 'date-fns';

// Utility functions
const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const calculateEndTimeFromNow = () => {
  const now = new Date();
  const endTime = addHours(now, 1);
  return format(endTime, 'h:mm a');
};

const validatePhoneNumber = (phone) => /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ''));
const validateName = (name) => /^[a-zA-Z\s]+$/.test(name.trim());

const NewEntry = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    kidName: '',
    kidDob: '',
    kidGender: '',
    parentName: '',
    parentPhone: '',
    package: '1 Hour',
    timeSlot: format(new Date(), 'h:mm a'),
    entryDate: format(startOfToday(), 'yyyy-MM-dd'),
    estimatedEnd: calculateEndTimeFromNow()
  });

  const [errors, setErrors] = useState({});
  const [shake, setShake] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [entryDate, setEntryDate] = useState(startOfToday());
  const [timeValue, setTimeValue] = useState(getCurrentTime());

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch customers on component mount
  useEffect(() => {
    const fetchCustomers = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get('http://192.168.1.9:8080/GetUniqueCustomer');
        const transformedCustomers = response.data.map(customer => ({
          kidName: customer.kidname || '',
          kidDob: customer.dob || '',
          kidGender: customer.gender || '',
          parentName: customer.parentname || '',
          parentPhone: customer.mobile || ''
        }));
        setCustomers(transformedCustomers);
      } catch (error) {
        console.error('Error fetching customers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCustomers();
  }, []);

  // Initialize form with location state if available
  useEffect(() => {
    if (location.state?.formData) {
      const data = location.state.formData;
      setFormData(data);
      if (data.kidDob) setStartDate(new Date(data.kidDob));
      if (data.entryDate) setEntryDate(new Date(data.entryDate));
      if (data.timeSlot) setTimeValue(data.timeSlot);

      const duration = parseInt(data.package?.split(' ')[0]);
      if (data.timeSlot && duration) {
        setFormData(prev => ({
          ...prev,
          estimatedEnd: calculateEndTime(data.timeSlot, duration)
        }));
      }
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Phone number handling
    if (name === 'parentPhone') {
      const formattedValue = value.replace(/\D/g, '');
      if (formattedValue.length > 10) return;
      
      setFormData(prev => ({ ...prev, [name]: formattedValue }));

      if (formattedValue.length >= 3) {
        const matches = customers.filter(c => {
          const normalizedPhone = c.parentPhone?.replace(/\D/g, '');
          return normalizedPhone?.includes(formattedValue);
        });
        setFilteredCustomers(matches);
        setShowModal(matches.length > 0);
      } else {
        setShowModal(false);
      }
    } 
    // Name validation
    else if (name === 'kidName' || name === 'parentName') {
      if (value === '' || validateName(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Kid name validation
    if (!formData.kidName.trim()) {
      newErrors.kidName = 'Please enter kid\'s name';
    } else if (!validateName(formData.kidName)) {
      newErrors.kidName = 'Name can only contain letters and spaces';
    }
    
    // Date of birth validation
    if (!formData.kidDob) {
      newErrors.kidDob = 'Please select date of birth';
    } else {
      const dob = new Date(formData.kidDob);
      const today = new Date();
      if (isAfter(dob, today)) {
        newErrors.kidDob = 'Date of birth cannot be in the future';
      }
    }
    
    // Gender validation
    if (!formData.kidGender) {
      newErrors.kidGender = 'Please select gender';
    }
    
    // Parent name validation
    if (!formData.parentName.trim()) {
      newErrors.parentName = 'Please enter parent\'s name';
    } else if (!validateName(formData.parentName)) {
      newErrors.parentName = 'Name can only contain letters and spaces';
    }
    
    // Phone validation
    if (!formData.parentPhone) {
      newErrors.parentPhone = 'Please enter phone number';
    } else if (!validatePhoneNumber(formData.parentPhone)) {
      newErrors.parentPhone = 'Please enter a valid 10-digit Indian phone number';
    }
    
    // Package validation
    if (!formData.package) {
      newErrors.package = 'Please select a package';
    }
    
    // Entry date validation
    if (!formData.entryDate) {
      newErrors.entryDate = 'Please select entry date';
    } else if (isBefore(new Date(formData.entryDate), startOfToday())) {
      newErrors.entryDate = 'Entry date cannot be in the past';
    }
    
    // Time slot validation
    if (!formData.timeSlot) {
      newErrors.timeSlot = 'Please select time slot';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      navigate('/billing-details', { state: { formData } });
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const calculateEndTime = (startTime, durationHours) => {
    if (!startTime || !durationHours) return '';
    
    let [timePart, modifier] = startTime.includes(' ') ? 
      startTime.split(' ') : [startTime, ''];
    
    let [hours, minutes] = timePart.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    const startDateObj = new Date(formData.entryDate || new Date());
    startDateObj.setHours(hours);
    startDateObj.setMinutes(minutes);

    const endDate = new Date(startDateObj.getTime() + durationHours * 60 * 60 * 1000);
    return format(endDate, 'h:mm a');
  };

  const handleTimeChange = (value) => {
    if (!value) return;
    
    setTimeValue(value);
    const [hourStr, minute] = value.split(':');
    let hour = parseInt(hourStr);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;

    const formattedTime = `${hour}:${minute.padStart(2, '0')} ${ampm}`;
    const duration = parseInt(formData.package.split(' ')[0]);

    setFormData(prev => ({
      ...prev,
      timeSlot: formattedTime,
      estimatedEnd: calculateEndTime(value, duration)
    }));
  };

  const handlePackageChange = (e) => {
    const value = e.target.value;
    const duration = parseInt(value.split(' ')[0]);
    setFormData(prev => ({
      ...prev,
      package: value,
      estimatedEnd: calculateEndTime(timeValue, duration)
    }));
  };

  const fillFormFromCustomer = (cust) => {
    setFormData(prev => ({
      ...prev,
      kidName: cust.kidName || '',
      kidDob: cust.kidDob || '',
      kidGender: cust.kidGender || '',
      parentName: cust.parentName || '',
      parentPhone: cust.parentPhone || ''
    }));
    if (cust.kidDob) setStartDate(new Date(cust.kidDob));
    setShowModal(false);
  };

  const clearFormData = () => {
    setFormData({
      kidName: '',
      kidDob: '',
      kidGender: '',
      parentName: '',
      parentPhone: '',
      package: '1 Hour',
      timeSlot: format(new Date(), 'h:mm a'),
      entryDate: format(startOfToday(), 'yyyy-MM-dd'),
      estimatedEnd: calculateEndTimeFromNow()
    });
    setStartDate(null);
    setEntryDate(startOfToday());
    setTimeValue(getCurrentTime());
    setErrors({});
  };

  return (
    <div className={`max-w-7xl mx-auto mt-2 bg-white rounded-xl shadow-md p-8 ${shake ? 'animate-shake' : ''}`}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">New Entry</h2>
        <button 
          onClick={clearFormData}
          className="ml-auto rounded-md text-white py-2 px-4 bg-blue-500 hover:bg-blue-600 transition cursor-pointer"
        >
          Clear Form
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Kid & Parent Details */}
          <div className="space-y-6">
            {/* Kid Details */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Kid's Detail</h3>
              <div className="space-y-4">
                {/* Kid Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Kid Name*</label>
                  <input
                    type="text"
                    name="kidName"
                    value={formData.kidName}
                    onChange={handleChange}
                    className={`w-full border ${errors.kidName ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3`}
                    placeholder="Enter kid's full name"
                  />
                  {errors.kidName && <p className="text-red-500 text-xs mt-1">{errors.kidName}</p>}
                </div>
  <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number*</label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    className={`w-full border ${errors.parentPhone ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3`}
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                  />
                  {errors.parentPhone && <p className="text-red-500 text-xs mt-1">{errors.parentPhone}</p>}
                </div>
                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth*</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => {
                      setStartDate(date);
                      const formatted = date ? format(date, 'yyyy-MM-dd') : '';
                      setFormData(prev => ({ ...prev, kidDob: formatted }));
                      if (errors.kidDob) setErrors(prev => ({ ...prev, kidDob: '' }));
                    }}
                    dateFormat="yyyy-MM-dd"
                    className={`w-full border ${errors.kidDob ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3`}
                    placeholderText="Select date of birth"
                    showYearDropdown
                    dropdownMode="select"
                    maxDate={new Date()}
                    peekNextMonth
                    showMonthDropdown
                  />
                  {errors.kidDob && <p className="text-red-500 text-xs mt-1">{errors.kidDob}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Gender*</label>
                  <select
                    name="kidGender"
                    value={formData.kidGender}
                    onChange={handleChange}
                    className={`w-full border ${errors.kidGender ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  
                  </select>
                  {errors.kidGender && <p className="text-red-500 text-xs mt-1">{errors.kidGender}</p>}
                </div>
              </div>
            </div>

            {/* Parent Detail */}
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Parent Detail</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Parent Name*</label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    className={`w-full border ${errors.parentName ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3`}
                    placeholder="Enter parent's full name"
                  />
                  {errors.parentName && <p className="text-red-500 text-xs mt-1">{errors.parentName}</p>}
                </div>
              
              </div>
            </div>
          </div>

          {/* Package & Time */}
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Package Detail</h3>
              <label className="block text-sm font-medium text-gray-500 mb-1">Select Package*</label>
              <select
                name="package"
                value={formData.package}
                onChange={handlePackageChange}
                className={`w-full border ${errors.package ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3`}
              >
                <option value="1 Hour">1 Hour</option>
                <option value="2 Hours">2 Hours</option>
           
                {/* <option value="Full Day">Full Day</option> */}
              </select>
              {errors.package && <p className="text-red-500 text-xs mt-1">{errors.package}</p>}
            </div>

            <div>
              <h3 className="text-base font-semibold text-gray-800 mb-4">Time Slot</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Start Time*</label>
                  <TimePicker
                    onChange={handleTimeChange}
                    value={timeValue}
                    className={`w-full border ${errors.timeSlot ? 'border-red-500' : 'border-gray-300'} rounded-md`}
                    disableClock={true}
                    clearIcon={null}
                    format="hh:mm a"
                  />
                  {errors.timeSlot && <p className="text-red-500 text-xs mt-1">{errors.timeSlot}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Entry Date*</label>
                  <DatePicker
                    selected={entryDate}
                    onChange={(date) => {
                      setEntryDate(date);
                      const formattedDate = date ? format(date, 'yyyy-MM-dd') : '';
                      setFormData(prev => ({ ...prev, entryDate: formattedDate }));
                      if (errors.entryDate) setErrors(prev => ({ ...prev, entryDate: '' }));
                    }}
                    dateFormat="yyyy-MM-dd"
                    className={`w-full border ${errors.entryDate ? 'border-red-500' : 'border-gray-300'} rounded-md px-4 py-3`}
                    placeholderText="Select visit date"
                    showYearDropdown
                    dropdownMode="select"
                    minDate={startOfToday()}
                  />
                  {errors.entryDate && <p className="text-red-500 text-xs mt-1">{errors.entryDate}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Estimated End</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.estimatedEnd}
                    className="w-full border border-gray-300 rounded-md px-4 py-3 bg-gray-100 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition font-medium"
              >
                Continue to billing
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Customer Search Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Select a customer</h3>
            {isLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredCustomers.length > 0 ? (
              <>
                <p className="text-sm text-gray-500 mb-3">Found {filteredCustomers.length} matching customer(s)</p>
                <ul className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredCustomers.map((cust, idx) => (
                    <li 
                      key={idx} 
                      className="p-2 border rounded hover:bg-gray-100 cursor-pointer transition"
                      onClick={() => fillFormFromCustomer(cust)}
                    >
                      <p className="font-medium">{cust.parentName}</p>
                      <p className="text-sm text-gray-500">+91 {cust.parentPhone}</p>
                      <p className="text-sm text-gray-500">Kid: {cust.kidName}, {cust.kidGender}</p>
                      {cust.kidDob && <p className="text-sm text-gray-500">DOB: {format(new Date(cust.kidDob), 'dd-MM-yyyy')}</p>}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-gray-500">No matching customers found</p>
            )}
            <div className="mt-4 flex justify-between">
              <button 
                onClick={() => setShowModal(false)} 
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setFilteredCustomers([]);
                }} 
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
              >
                Create New Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewEntry;