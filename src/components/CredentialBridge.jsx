"use client";

import React, { useState, useEffect } from 'react';
import { Upload, Brain, Users, ArrowRight, Globe, CheckCircle, Star, MapPin, AlertCircle, Loader, FileText, Image, FileX } from 'lucide-react';

const CredentialBridge = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [showForm, setShowForm] = useState(false);
  
  // Enhanced form state
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [results, setResults] = useState(null);
  
  // Combined form data for both file upload and manual entry
  const [formData, setFormData] = useState({
    school: "",
    degree: "",
    year: "",
    country: "",
    education: "",
    workHistory: "",
    skills: "",
    careerGoals: ""
  });

  // Animated counter for stats
  const [stats, setStats] = useState({ matches: 0, users: 0, success: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => ({
        matches: Math.min(prev.matches + 47, 2847),
        users: Math.min(prev.users + 23, 1523),
        success: Math.min(prev.success + 1, 92)
      }));
    }, 50);

    return () => clearInterval(timer);
  }, []);

  // File validation
  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp'
    ];

    if (file.size > maxSize) {
      return 'File size must be less than 10MB';
    }

    if (!allowedTypes.includes(file.type)) {
      return 'Only PDF and image files (JPG, PNG, WebP) are allowed';
    }

    return null;
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Basic validation for manual entry
    if (!formData.school.trim() && !file) newErrors.school = 'School/University is required (or upload a document)';
    if (!formData.degree.trim() && !file) newErrors.degree = 'Degree/Program is required (or upload a document)';
    if ((!formData.year || formData.year < 1950 || formData.year > new Date().getFullYear()) && !file) {
      newErrors.year = 'Please enter a valid graduation year (or upload a document)';
    }
    if (!formData.country.trim() && !file) newErrors.country = 'Country is required (or upload a document)';

    // Enhanced validation for AI matching
    if (!formData.education.trim() && !file) newErrors.education = 'Education background is required for AI matching';
    if (!formData.skills.trim() && !file) newErrors.skills = 'Skills are required for AI matching';
    if (!formData.careerGoals.trim() && !file) newErrors.careerGoals = 'Career goals help us provide better matches';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleFileChange = (selectedFile) => {
    if (selectedFile) {
      const fileError = validateFile(selectedFile);
      if (fileError) {
        setErrors({ ...errors, file: fileError });
        return;
      }
      
      setFile(selectedFile);
      setErrors({ ...errors, file: null });
    }
  };

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitStatus(null);
    setResults(null);

    try {
      let response;
      
      if (file) {
        // Handle file upload with FormData
        const data = new FormData();
        data.append("file", file);
        
        // Add form data
        for (const key in formData) {
          if (formData[key]) {
            data.append(key, formData[key]);
          }
        }

        response = await fetch('/api/match', {
          method: 'POST',
          body: data, // Don't set Content-Type header for FormData
        });
      } else {
        // Handle JSON submission
        response = await fetch('/api/match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            education: formData.education || `${formData.degree} from ${formData.school} (${formData.year}) in ${formData.country}`,
            workHistory: formData.workHistory,
            skills: formData.skills,
            careerGoals: formData.careerGoals,
            school: formData.school,
            degree: formData.degree,
            year: formData.year,
            country: formData.country
          }),
        });
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('✅ Success: API Response:', data);
      setResults(data);
      setSubmitStatus('success');
      
    } catch (error) {
      console.error('❌ Submit error:', error);
      setSubmitStatus('error');
      setErrors({ submit: error.message || 'Failed to submit. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setFormData({ 
      school: "", 
      degree: "", 
      year: "", 
      country: "",
      education: "",
      workHistory: "",
      skills: "",
      careerGoals: ""
    });
    setErrors({});
    setSubmitStatus(null);
    setResults(null);
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-8 h-8" />;
    
    if (file.type === 'application/pdf') {
      return <FileText className="w-8 h-8 text-red-500" />;
    }
    return <Image className="w-8 h-8 text-blue-500" />;
  };

  const removeFile = () => {
    setFile(null);
    setErrors({ ...errors, file: null });
  };

  const steps = [
    {
      icon: Upload,
      title: "Upload Credentials",
      description: "Share your education documents or enter details manually"
    },
    {
      icon: Brain,
      title: "AI Analysis",
      description: "Our AI analyzes your background and identifies opportunities"
    },
    {
      icon: Users,
      title: "Smart Matching",
      description: "Get matched with mentors, jobs, and career pathways"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      country: "🇨🇳 China → 🇨🇦 Canada",
      text: "Found my dream job in tech within 3 months of using this platform!"
    },
    {
      name: "Ahmed Hassan",
      role: "Marketing Manager",
      country: "🇪🇬 Egypt → 🇨🇦 Canada",
      text: "The mentor matching feature connected me with someone who truly understood my journey."
    }
  ];

  // Enhanced Form Component with Results
  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => {
              setShowForm(false);
              resetForm();
            }}
            className="mb-8 text-white hover:text-purple-300 transition-colors flex items-center gap-2"
          >
            ← Back to Home
          </button>
          
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20">
            <h2 className="text-3xl font-bold text-white mb-2 text-center">Upload Your Credential</h2>
            <p className="text-white/70 text-center mb-8">Share your educational background to get AI-powered career matches</p>
            
            {/* Success Message */}
            {submitStatus === 'success' && !results && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300">Credential submitted successfully! Processing your matches...</span>
              </div>
            )}

            {/* Error Message */}
            {submitStatus === 'error' && errors.submit && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-300">{errors.submit}</span>
              </div>
            )}

            {/* Results Display */}
            {results && results.matches && (
              <div className="mb-8 bg-green-500/10 border border-green-500/30 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  Your AI-Powered Matches
                </h3>
                
                <div className="space-y-4">
                  {results.matches.map((match, index) => (
                    <div key={index} className="bg-white/10 p-4 rounded-lg border border-white/20">
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-semibold text-white">
                          {match.type?.toUpperCase()}: {match.name} - {match.role}
                        </div>
                        <div className="bg-purple-500/20 text-purple-300 px-2 py-1 rounded text-sm">
                          {match.matchScore}% Match
                        </div>
                      </div>
                      <p className="text-white/80 text-sm">{match.summary}</p>
                    </div>
                  ))}
                </div>
                
                {results.newcomerSummary && (
                  <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-200 text-sm italic">{results.newcomerSummary}</p>
                  </div>
                )}
                
                <button
                  onClick={resetForm}
                  className="mt-4 bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-6 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-300"
                >
                  Start New Search
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* File Upload Area */}
              <div>
                <label className="block text-white font-medium mb-3">Document Upload (Optional)</label>
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 ${
                    dragActive 
                      ? 'border-purple-400 bg-purple-500/20' 
                      : file 
                      ? 'border-green-400 bg-green-500/10' 
                      : errors.file 
                      ? 'border-red-400 bg-red-500/10' 
                      : 'border-white/30 bg-white/5 hover:bg-white/10'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <div className="flex flex-col items-center gap-3">
                    {getFileIcon()}
                    
                    {file ? (
                      <div className="text-center">
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-white/60 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button
                          type="button"
                          onClick={removeFile}
                          className="mt-2 text-red-400 hover:text-red-300 text-sm flex items-center gap-1 mx-auto"
                        >
                          <FileX className="w-4 h-4" /> Remove
                        </button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-white font-medium">Drop your document here</p>
                        <p className="text-white/60 text-sm">or click to browse (PDF, JPG, PNG up to 10MB)</p>
                      </div>
                    )}
                  </div>
                </div>
                {errors.file && (
                  <p className="mt-2 text-red-400 text-sm flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {errors.file}
                  </p>
                )}
              </div>

              <div className="border-t border-white/20 pt-6">
                <h3 className="text-white font-medium mb-4">Enter your details for AI matching:</h3>
                
                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <input
                      type="text"
                      name="school"
                      placeholder="School/University *"
                      value={formData.school}
                      onChange={handleChange}
                      className={`w-full p-4 bg-white/20 border rounded-xl text-white placeholder-white/70 focus:outline-none transition-colors ${
                        errors.school ? 'border-red-400' : 'border-white/30 focus:border-purple-400'
                      }`}
                    />
                    {errors.school && (
                      <p className="mt-1 text-red-400 text-sm">{errors.school}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      name="degree"
                      placeholder="Degree/Program *"
                      value={formData.degree}
                      onChange={handleChange}
                      className={`w-full p-4 bg-white/20 border rounded-xl text-white placeholder-white/70 focus:outline-none transition-colors ${
                        errors.degree ? 'border-red-400' : 'border-white/30 focus:border-purple-400'
                      }`}
                    />
                    {errors.degree && (
                      <p className="mt-1 text-red-400 text-sm">{errors.degree}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="number"
                      name="year"
                      placeholder="Graduation Year *"
                      value={formData.year}
                      onChange={handleChange}
                      min="1950"
                      max={new Date().getFullYear()}
                      className={`w-full p-4 bg-white/20 border rounded-xl text-white placeholder-white/70 focus:outline-none transition-colors ${
                        errors.year ? 'border-red-400' : 'border-white/30 focus:border-purple-400'
                      }`}
                    />
                    {errors.year && (
                      <p className="mt-1 text-red-400 text-sm">{errors.year}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="text"
                      name="country"
                      placeholder="Country of Origin *"
                      value={formData.country}
                      onChange={handleChange}
                      className={`w-full p-4 bg-white/20 border rounded-xl text-white placeholder-white/70 focus:outline-none transition-colors ${
                        errors.country ? 'border-red-400' : 'border-white/30 focus:border-purple-400'
                      }`}
                    />
                    {errors.country && (
                      <p className="mt-1 text-red-400 text-sm">{errors.country}</p>
                    )}
                  </div>
                </div>

                {/* AI Matching Fields */}
                <div className="space-y-4">
                  <div>
                    <textarea
                      name="education"
                      placeholder="Education Background (detailed) *"
                      value={formData.education}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full p-4 bg-white/20 border rounded-xl text-white placeholder-white/70 focus:outline-none transition-colors resize-none ${
                        errors.education ? 'border-red-400' : 'border-white/30 focus:border-purple-400'
                      }`}
                    />
                    {errors.education && (
                      <p className="mt-1 text-red-400 text-sm">{errors.education}</p>
                    )}
                  </div>

                  <div>
                    <textarea
                      name="workHistory"
                      placeholder="Work History & Experience"
                      value={formData.workHistory}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-4 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:border-purple-400 transition-colors resize-none"
                    />
                  </div>

                  <div>
                    <textarea
                      name="skills"
                      placeholder="Skills & Competencies *"
                      value={formData.skills}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full p-4 bg-white/20 border rounded-xl text-white placeholder-white/70 focus:outline-none transition-colors resize-none ${
                        errors.skills ? 'border-red-400' : 'border-white/30 focus:border-purple-400'
                      }`}
                    />
                    {errors.skills && (
                      <p className="mt-1 text-red-400 text-sm">{errors.skills}</p>
                    )}
                  </div>

                  <div>
                    <textarea
                      name="careerGoals"
                      placeholder="Career Goals & Aspirations *"
                      value={formData.careerGoals}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full p-4 bg-white/20 border rounded-xl text-white placeholder-white/70 focus:outline-none transition-colors resize-none ${
                        errors.careerGoals ? 'border-red-400' : 'border-white/30 focus:border-purple-400'
                      }`}
                    />
                    {errors.careerGoals && (
                      <p className="mt-1 text-red-400 text-sm">{errors.careerGoals}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-2 ${
                  loading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transform hover:scale-105'
                } text-white`}
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Finding Your Matches...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5" />
                    Get AI-Powered Career Matches
                  </>
                )}
              </button>
            </form>

            <p className="text-white/50 text-sm text-center mt-6">
              * Required fields. Your information is secure and encrypted.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Landing Page
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-72 h-72 bg-purple-500 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 -right-8 w-96 h-96 bg-blue-500 rounded-full opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-pink-500 rounded-full opacity-20 animate-pulse delay-2000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">CredentialBridge</span>
        </div>
        <div className="flex gap-6 text-white">
          <a href="#" className="hover:text-purple-300 transition-colors">How it Works</a>
          <a href="#" className="hover:text-purple-300 transition-colors">Success Stories</a>
          <a href="#" className="hover:text-purple-300 transition-colors">Contact</a>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center">
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
            Bridge Your Credentials to
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {" "}Canadian Careers
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            Powered by AI, our platform helps newcomers match their international education 
            and experience with career opportunities in Canada. Connect with mentors, 
            discover pathways, and build your future.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-300 shadow-lg flex items-center gap-2"
            >
              Get Started <ArrowRight className="w-5 h-5" />
            </button>
            <button className="border-2 border-white/30 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">{stats.matches.toLocaleString()}+</div>
            <div className="text-white/70">Successful Matches</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">{stats.users.toLocaleString()}+</div>
            <div className="text-white/70">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-2">{stats.success}%</div>
            <div className="text-white/70">Success Rate</div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="relative z-10 bg-white/5 backdrop-blur-lg border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <h2 className="text-4xl font-bold text-white text-center mb-16">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center hover:bg-white/20 transition-all duration-300 border border-white/20">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">{step.title}</h3>
                  <p className="text-white/70 text-lg">{step.description}</p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-white/50">
                    <ArrowRight className="w-full h-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">Success Stories</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-white/90 text-lg mb-6 italic">"{testimonial.text}"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">{testimonial.name[0]}</span>
                </div>
                <div>
                  <div className="text-white font-semibold">{testimonial.name}</div>
                  <div className="text-white/70">{testimonial.role}</div>
                  <div className="text-white/50 text-sm">{testimonial.country}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Footer */}
      <div className="relative z-10 bg-gradient-to-r from-purple-600 to-pink-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Bridge Your Future?</h2>
          <p className="text-xl text-white/90 mb-8">Join thousands of successful immigrants who found their path in Canada</p>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-white text-purple-600 py-4 px-8 rounded-xl font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
          >
            Start Your Journey Today
          </button>
        </div>
      </div>
    </div>
  );
};

export default CredentialBridge;