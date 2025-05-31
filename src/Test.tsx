// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import Select from 'react-select';

// const Test = () => {
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     reset,
//     setValue,
//     watch
//   } = useForm();

//   const [records, setRecords] = useState([]);
//   const [editingId, setEditingId] = useState(null);
//   const [options, setOptions] = useState([
//     { value: 'apple', label: 'Apple' },
//     { value: 'banana', label: 'Banana' },
//     { value: 'orange', label: 'Orange' },
//     { value: 'grape', label: 'Grape' },
//     { value: 'mango', label: 'Mango' },
//   ]);
//   const [inputValue, setInputValue] = useState('');

//   const onSubmit = (data) => {
//     if (editingId) {
//       // Update existing record
//       setRecords(records.map(record => 
//         record.id === editingId ? { ...data, id: editingId } : record
//       ));
//       setEditingId(null);
//     } else {
//       // Add new record
//       const newRecord = {
//         ...data,
//         id: Date.now(),
//       };
//       setRecords([...records, newRecord]);
//     }
    
//     if (data.fruit && !options.some(opt => opt.value === data.fruit.value)) {
//       setOptions([...options, {
//         value: data.fruit.value,
//         label: data.fruit.label
//       }]);
//     }
    
//     reset();
//   };

//   const handleEdit = (record) => {
//     setEditingId(record.id);
//     // Set form values for editing
//     setValue('name', record.name);
//     setValue('email', record.email);
//     setValue('fruit', record.fruit);
//   };

//   const handleDelete = (id) => {
//     setRecords(records.filter(record => record.id !== id));
//     if (editingId === id) {
//       setEditingId(null);
//       reset();
//     }
//   };

//   const handleCreateOption = (inputValue) => {
//     const newOption = {
//       value: inputValue.toLowerCase(),
//       label: inputValue
//     };
//     setOptions([...options, newOption]);
//     setValue('fruit', newOption);
//     return newOption;
//   };

//   return (
//     <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
//       <h2>React-Select Autocomplete with Edit Button</h2>
      
//       <form onSubmit={handleSubmit(onSubmit)} style={{ marginBottom: '30px' }}>
//         <div style={{ marginBottom: '15px' }}>
//           <label htmlFor="name">Name:</label>
//           <input
//             id="name"
//             {...register('name', { required: 'Name is required' })}
//             style={{
//               width: '100%',
//               padding: '8px',
//               border: errors.name ? '1px solid red' : '1px solid #ccc'
//             }}
//           />
//           {errors.name && (
//             <p style={{ color: 'red', margin: '5px 0 0', fontSize: '0.8rem' }}>
//               {errors.name.message}
//             </p>
//           )}
//         </div>

//         <div style={{ marginBottom: '15px' }}>
//           <label htmlFor="email">Email:</label>
//           <input
//             id="email"
//             type="email"
//             {...register('email', {
//               required: 'Email is required',
//               pattern: {
//                 value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                 message: 'Invalid email address'
//               }
//             })}
//             style={{
//               width: '100%',
//               padding: '8px',
//               border: errors.email ? '1px solid red' : '1px solid #ccc'
//             }}
//           />
//           {errors.email && (
//             <p style={{ color: 'red', margin: '5px 0 0', fontSize: '0.8rem' }}>
//               {errors.email.message}
//             </p>
//           )}
//         </div>

//         <div style={{ marginBottom: '15px' }}>
//           <label>Favorite Fruit:</label>
//           <Select
//             {...register('fruit', { required: 'Please select or create a fruit' })}
//             options={options}
//             isClearable
//             isSearchable
//             onCreateOption={handleCreateOption}
//             onChange={(selected) => setValue('fruit', selected)}
//             value={watch('fruit')}
//             styles={{
//               control: (base) => ({
//                 ...base,
//                 border: errors.fruit ? '1px solid red' : '1px solid #ccc',
//                 minHeight: '38px'
//               })
//             }}
//           />
//           {errors.fruit && (
//             <p style={{ color: 'red', margin: '5px 0 0', fontSize: '0.8rem' }}>
//               {errors.fruit.message}
//             </p>
//           )}
//         </div>

//         <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
//           <button
//             type="submit"
//             style={{
//               padding: '8px 16px',
//               backgroundColor: editingId ? '#FFA500' : '#4CAF50',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer'
//             }}
//           >
//             {editingId ? 'Update' : 'Submit'}
//           </button>

//           {editingId && (
//             <button
//               type="button"
//               onClick={() => {
//                 setEditingId(null);
//                 reset();
//               }}
//               style={{
//                 padding: '8px 16px',
//                 backgroundColor: '#f44336',
//                 color: 'white',
//                 border: 'none',
//                 borderRadius: '4px',
//                 cursor: 'pointer'
//               }}
//             >
//               Cancel
//             </button>
//           )}
//         </div>
//       </form>

//       <h3>Records</h3>
//       {records.length === 0 ? (
//         <p>No records yet. Add some using the form above.</p>
//       ) : (
//         <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//           <thead>
//             <tr style={{ backgroundColor: '#f2f2f2' }}>
//               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
//               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
//               <th style={{ padding: '10px', border: '1px solid #ddd' }}>Favorite Fruit</th>
//               <th style={{ padding: '10px', border: '1px solid #ddd', width: '150px' }}>Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {records.map(record => (
//               <tr 
//                 key={record.id} 
//                 style={{ 
//                   backgroundColor: editingId === record.id ? '#fffde7' : 'white'
//                 }}
//               >
//                 <td style={{ padding: '10px', border: '1px solid #ddd' }}>{record.name}</td>
//                 <td style={{ padding: '10px', border: '1px solid #ddd' }}>{record.email}</td>
//                 <td style={{ padding: '10px', border: '1px solid #ddd' }}>{record.fruit?.label}</td>
//                 <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'center' }}>
//                   <button
//                     onClick={() => handleEdit(record)}
//                     style={{
//                       padding: '5px 10px',
//                       backgroundColor: '#2196F3',
//                       color: 'white',
//                       border: 'none',
//                       borderRadius: '4px',
//                       cursor: 'pointer',
//                       marginRight: '5px'
//                     }}
//                   >
//                     Edit
//                   </button>
//                   <button
//                     onClick={() => handleDelete(record.id)}
//                     style={{
//                       padding: '5px 10px',
//                       backgroundColor: '#f44336',
//                       color: 'white',
//                       border: 'none',
//                       borderRadius: '4px',
//                       cursor: 'pointer'
//                     }}
//                   >
//                     Delete
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default Test;


import React from 'react'

const Test = () => {
  return (
    <div>
      
    </div>
  )
}

export default Test