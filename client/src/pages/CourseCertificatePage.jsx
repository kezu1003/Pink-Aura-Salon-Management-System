import React, { useState, useEffect } from 'react';
import logo from '../assets/logo.jpg';

const CourseCertificatePage = () => {
  const [studentName, setStudentName] = useState('');
  const [courseName, setCourseName] = useState('');
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split('T')[0]);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);

  const currentDateFormatted = new Date(completionDate).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  useEffect(() => {
    // Animation on load
    const certificate = document.querySelector('.certificate-container');
    if (certificate) {
      certificate.style.opacity = '0';
      certificate.style.transform = 'scale(0.9)';
      certificate.style.transition = 'all 0.8s ease-out';
      
      setTimeout(() => {
        certificate.style.opacity = '1';
        certificate.style.transform = 'scale(1)';
      }, 100);
    }
  }, []);

  const handleDownloadCertificate = async () => {
    if (!studentName.trim() || !courseName.trim()) {
      alert('Please fill in both Student Name and Course Name before downloading the certificate.');
      return;
    }
    
    setDownloadingCertificate(true);
    setTimeout(() => {
      window.print();
      setDownloadingCertificate(false);
      alert("Certificate print dialog opened!");
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8" 
         style={{ background: 'linear-gradient(135deg, #FEF4F1 0%, #FBAA99 50%, #4D423AA 100%)' }}>
      
      {/* Control Panel */}
      <div className="fixed top-4 left-4 bg-white rounded-lg shadow-lg p-4 print:hidden z-50">
        <h3 className="text-lg font-bold mb-4 text-gray-800">Certificate Generator</h3>
        
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Enter student name"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-300 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
            <input
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              placeholder="Enter course name"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-300 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Completion Date</label>
            <input
              type="date"
              value={completionDate}
              onChange={(e) => setCompletionDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-300 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={handleDownloadCertificate}
            disabled={downloadingCertificate}
            className="w-full px-4 py-2 bg-pink-400 text-white font-semibold rounded hover:bg-pink-500 transition-colors disabled:opacity-50"
          >
            {downloadingCertificate ? 'Generating...' : 'Download Certificate'}
          </button>
        </div>
      </div>

      <div className="certificate-container w-full max-w-7xl relative rounded-3xl shadow-2xl overflow-hidden"
           style={{ 
             background: 'linear-gradient(135deg, #ffffff 0%, #FEF4F1 100%)',
             aspectRatio: '4/3',
             height: '900px',
             minHeight: '900px'
           }}>
        
        {/* Decorative Border */}
        <div className="absolute top-6 left-6 right-6 bottom-6 border-4 rounded-2xl" 
             style={{ borderColor: '#FBAA99' }}></div>
        
        {/* Salon-themed Corner Decorations */}
        <div className="absolute w-28 h-28 rounded-full -top-14 -left-14 flex items-center justify-center" 
             style={{ background: 'linear-gradient(45deg, #FBAA99, #FEF4F1)' }}>
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3z"/>
          </svg>
        </div>
        
        <div className="absolute w-28 h-28 rounded-full -top-14 -right-14 flex items-center justify-center" 
             style={{ background: 'linear-gradient(45deg, #FBAA99, #FEF4F1)' }}>
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H8zm0 12V7h8v10H8zm2-8h4v2h-4V9zm0 3h4v2h-4v-2z"/>
          </svg>
        </div>
        
        <div className="absolute w-28 h-28 rounded-full -bottom-14 -left-14 flex items-center justify-center" 
             style={{ background: 'linear-gradient(45deg, #FBAA99, #FEF4F1)' }}>
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.69 2 6 4.69 6 8v8c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V8c0-3.31-2.69-6-6-6zm0 2c2.21 0 4 1.79 4 4v8H8V8c0-2.21 1.79-4 4-4z"/>
            <path d="M10 10h4v6h-4z"/>
          </svg>
        </div>
        
        <div className="absolute w-28 h-28 rounded-full -bottom-14 -right-14 flex items-center justify-center" 
             style={{ background: 'linear-gradient(45deg, #FBAA99, #FEF4F1)' }}>
          <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 3.87 3.13 7 7 7s7-3.13 7-7c0-3.87-3.13-7-7-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm-1 2v4h2v-4h-2z"/>
          </svg>
        </div>
        
        {/* Salon-themed Ribbon */}
        <div className="absolute top-0 right-0 w-48 h-48 flex items-start justify-end pt-6 pr-6" 
             style={{ 
               background: 'linear-gradient(135deg, #FBAA99 0%, #4D423AA 100%)',
               clipPath: 'polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)'
             }}>
          <svg className="w-8 h-8 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l1.09 3.26L16 4l-1.91 1.09L16 8l-2.91-1.09L12 10l-1.09-3.26L8 8l1.91-1.09L8 4l2.91 1.09L12 2z"/>
            <path d="M5 12l.5 1.5L7 13l-.5.5L7 15l-1.5-.5L5 16l-.5-1.5L3 15l.5-.5L3 13l1.5.5L5 12z"/>
            <path d="M19 12l.5 1.5L21 13l-.5.5L21 15l-1.5-.5L19 16l-.5-1.5L17 15l.5-.5L17 13l1.5.5L19 12z"/>
          </svg>
        </div>
        
        {/* Beauty Tool Decorative Elements */}
        <div className="absolute top-24 left-12 opacity-15">
          <svg className="w-16 h-16" style={{ color: '#FBAA99' }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div className="absolute bottom-24 right-12 opacity-15">
          <svg className="w-16 h-16" style={{ color: '#FBAA99' }} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-10"
             style={{
               backgroundImage: `
                 radial-gradient(circle at 20% 30%, rgba(251, 170, 153, 0.1) 0%, transparent 30%),
                 radial-gradient(circle at 80% 70%, rgba(77, 66, 58, 0.1) 0%, transparent 30%),
                 radial-gradient(circle at 40% 80%, rgba(251, 170, 153, 0.05) 0%, transparent 25%)
               `
             }}></div>
        
        {/* Main Content */}
        <div className="relative z-10 p-16 text-center h-full flex flex-col justify-between">
          
          {/* Top Section with Logo */}
          <div className="flex-shrink-0 pt-8">
            {/* LOGO SECTION - Replace this with your company logo */}
            <div className="mb-5">
              <img src={logo} alt="Company Logo" className="w-32 h-auto mx-auto" />
            </div>
          </div>
          
          {/* Center Content */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Certificate Title */}
            <h1 className="text-5xl font-bold mb-3 drop-shadow-sm relative" 
                style={{ 
                  fontFamily: 'serif',
                  color: '#4D423AA'
                }}>
              CERTIFICATE
              <svg className="absolute -top-2 -right-8 w-6 h-6 animate-pulse" style={{ color: '#FBAA99' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </h1>
            
            <p className="text-sm font-medium tracking-widest uppercase mb-6 relative" 
               style={{ color: '#FBAA99' }}>
              OF SALON
              <div className="flex items-center justify-center mt-2">
                <div className="w-8 h-0.5" style={{ backgroundColor: '#FBAA99' }}></div>
                <div className="w-2 h-2 rounded-full mx-2" style={{ backgroundColor: '#FBAA99' }}></div>
                <div className="w-8 h-0.5" style={{ backgroundColor: '#FBAA99' }}></div>
              </div>
            </p>
            
            <p className="text-base mb-4" style={{ color: '#4D423AA' }}>
              This certificate is proudly awarded to
            </p>
            
            <div className="mb-4 relative">
              <div className="text-4xl font-bold text-black border-b-2 pb-2 inline-block min-w-80 text-center relative"
                   style={{ 
                     fontFamily: 'serif',
                     borderColor: '#FBAA99'
                   }}>
                {studentName || '[Student Name]'}
              </div>
              <div className="absolute -left-8 top-2">
                <svg className="w-4 h-4 animate-pulse" style={{ color: '#FBAA99' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l1.09 3.26L16 4l-1.91 1.09L16 8l-2.91-1.09L12 10l-1.09-3.26L8 8l1.91-1.09L8 4l2.91 1.09L12 2z"/>
                </svg>
              </div>
              <div className="absolute -right-8 top-2">
                <svg className="w-4 h-4 animate-pulse" style={{ color: '#FBAA99' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l1.09 3.26L16 4l-1.91 1.09L16 8l-2.91-1.09L12 10l-1.09-3.26L8 8l1.91-1.09L8 4l2.91 1.09L12 2z"/>
                </svg>
              </div>
            </div>
            
            <div className="flex items-center justify-center mb-3">
              <svg className="w-4 h-4 mx-2" style={{ color: '#FBAA99' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
              <p className="text-sm" style={{ color: '#4D423AA' }}>
                for mastering the art of beauty in
              </p>
              <svg className="w-4 h-4 mx-2" style={{ color: '#FBAA99' }} fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              </svg>
            </div>
            
            <div className="mb-6 relative">
              <div className="absolute inset-0 rounded-xl opacity-20" 
                   style={{ background: 'linear-gradient(45deg, #FBAA99 0%, transparent 50%, #FBAA99 100%)' }}></div>
              <div className="text-lg font-semibold uppercase tracking-wide px-4 py-3 rounded-xl relative z-10"
                   style={{ color: '#FBAA99' }}>
                {courseName || '[COURSE NAME]'}
              </div>
            </div>
            
            <div className="flex justify-center mb-4">
              <div className="px-6 py-2 rounded-full border-2 flex items-center space-x-2" 
                   style={{ borderColor: '#FBAA99', backgroundColor: 'rgba(251, 170, 153, 0.1)' }}>
                <svg className="w-5 h-5" style={{ color: '#FBAA99' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
                <span className="text-sm font-medium" style={{ color: '#4D423AA' }}>Certified Professional</span>
                <svg className="w-5 h-5" style={{ color: '#FBAA99' }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
            </div>
          </div>
          
          {/* Bottom Section - Signature and Date with Certificate Seal */}
          <div className="flex-shrink-0 pb-8">
            <div className="flex justify-between items-end px-12">
              <div className="text-center flex-1">
                <div className="w-36 border-b border-current mx-auto mb-2 h-5 relative" style={{ borderColor: '#4D423AA' }}>
                  <svg className="absolute -left-6 top-0 w-4 h-4" style={{ color: '#FBAA99' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                  </svg>
                </div>
                <p className="text-xs font-medium" style={{ color: '#4D423AA' }}>Date of Completion</p>
                <p className="text-xs mt-1 font-semibold" style={{ color: '#FBAA99' }}>{currentDateFormatted}</p>
              </div>
              
              {/* Professional Certificate Seal */}
              <div className="flex-1 flex justify-center">
                <div className="relative w-24 h-24">
                  {/* Main circular seal */}
                  <div className="absolute inset-0 rounded-full border-4 border-yellow-400 bg-gradient-to-br from-yellow-400 via-yellow-500 to-yellow-600 shadow-lg">
                    {/* Inner circle with maroon background */}
                    <div className="absolute inset-2 rounded-full bg-gradient-to-br from-red-800 via-red-900 to-red-950 flex items-center justify-center">
                      {/* Stars around the inner circle */}
                      <div className="absolute inset-1 rounded-full border border-yellow-400 flex items-center justify-center">
                        <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      
                      {/* Small stars around the border */}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2">
                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <div className="absolute top-1/2 -right-1 transform -translate-y-1/2">
                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                      <div className="absolute top-1/2 -left-1 transform -translate-y-1/2">
                        <svg className="w-3 h-3 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Ribbon tails */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                    <div className="flex space-x-1">
                      {/* Left ribbon */}
                      <div className="w-8 h-12 bg-gradient-to-b from-red-600 to-red-800 transform -rotate-12 relative">
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-900"></div>
                      </div>
                      {/* Right ribbon */}
                      <div className="w-8 h-12 bg-gradient-to-b from-red-600 to-red-800 transform rotate-12 relative">
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-red-900"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative serrated edge */}
                  <div className="absolute -inset-2">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <defs>
                        <path id="serrated" d="M50,5 L52,8 L48,8 Z"/>
                      </defs>
                      <g fill="#dc2626">
                        {Array.from({length: 32}, (_, i) => (
                          <use key={i} href="#serrated" transform={`rotate(${i * 11.25} 50 50)`} />
                        ))}
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="text-center flex-1">
                <div className="w-36 border-b border-current mx-auto mb-2 h-5 relative" style={{ borderColor: '#4D423AA' }}>
                  <svg className="absolute -left-6 top-0 w-4 h-4" style={{ color: '#FBAA99' }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                  </svg>
                </div>
                <p className="text-xs font-medium" style={{ color: '#4D423AA' }}>Certified Instructor</p>
                <p className="text-xs mt-1" style={{ color: '#4D423AA' }}>Beauty Professional</p>
              </div>
            </div>
          </div>
          
          {/* Certificate ID */}
          <div className="absolute bottom-6 right-8 text-sm opacity-60" style={{ color: '#4D423AA' }}>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              <span>Certificate ID: BC-{new Date().getFullYear()}-{Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
            </div>
          </div>
        </div>
        
        {/* Floating Beauty Elements */}
        <div className="absolute top-1/4 left-20 opacity-20">
          <div className="w-4 h-4 rounded-full animate-bounce" style={{ backgroundColor: '#FBAA99', animationDelay: '0s' }}></div>
        </div>
        <div className="absolute top-1/3 right-28 opacity-20">
          <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: '#FBAA99', animationDelay: '0.5s' }}></div>
        </div>
        <div className="absolute bottom-1/3 left-28 opacity-20">
          <div className="w-4 h-4 rounded-full animate-bounce" style={{ backgroundColor: '#FBAA99', animationDelay: '1s' }}></div>
        </div>
        <div className="absolute bottom-1/4 right-20 opacity-20">
          <div className="w-3 h-3 rounded-full animate-bounce" style={{ backgroundColor: '#FBAA99', animationDelay: '1.5s' }}></div>
        </div>
      </div>
      
      {/* Print Button */}
      <button
        onClick={() => window.print()}
        className="fixed bottom-8 right-8 px-6 py-3 rounded-full text-white font-semibold shadow-lg hover:shadow-xl transition-all print:hidden flex items-center space-x-2 hover:bg-yellow-800"
        style={{ backgroundColor: '#8B4513' }}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
        </svg>
        <span>Print Certificate</span>
      </button>
    </div>
  );
};

export default CourseCertificatePage;