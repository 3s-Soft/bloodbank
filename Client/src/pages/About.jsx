import React from 'react';
import { FaHeart, FaUsers, FaHandHoldingHeart, FaAward, FaGlobe, FaShieldAlt } from 'react-icons/fa';

const About = () => {
  const teamMembers = [
    {
      name: 'Dr. Ahmed Hassan',
      role: 'Medical Director',
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
      description: 'Leading hematologist with 15+ years experience in blood banking'
    },
    {
      name: 'Fatima Rahman',
      role: 'Operations Manager',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=150&h=150&fit=crop&crop=face',
      description: 'Expert in healthcare operations and donor management'
    },
    {
      name: 'Mohammad Ali',
      role: 'Technology Lead',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      description: 'Software engineer passionate about healthcare technology'
    },
    {
      name: 'Rashida Begum',
      role: 'Community Outreach',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
      description: 'Dedicated to building community relationships and awareness'
    }
  ];

  const achievements = [
    {
      icon: <FaUsers className="text-4xl text-primary" />,
      number: '10,000+',
      label: 'Registered Donors',
      description: 'Active blood donors in our network'
    },
    {
      icon: <FaHeart className="text-4xl text-red-500" />,
      number: '25,000+',
      label: 'Lives Saved',
      description: 'Through successful blood donations'
    },
    {
      icon: <FaHandHoldingHeart className="text-4xl text-blue-500" />,
      number: '150+',
      label: 'Blood Drives',
      description: 'Community events organized'
    },
    {
      icon: <FaGlobe className="text-4xl text-green-500" />,
      number: '50+',
      label: 'Partner Hospitals',
      description: 'Collaborating healthcare facilities'
    }
  ];

  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section */}
      <div className="hero min-h-96 bg-gradient-to-r from-primary to-secondary">
        <div className="hero-overlay bg-opacity-60"></div>
        <div className="hero-content text-center text-primary-content">
          <div className="max-w-md">
            <h1 className="mb-5 text-5xl font-bold">About Us</h1>
            <p className="mb-5 text-xl">
              Connecting hearts, saving lives through voluntary blood donation in rural Chittagong.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Mission Section */}
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-8">Our Mission</h2>
          <p className="text-lg text-base-content/80 leading-relaxed">
            We are dedicated to bridging the gap between blood donors and recipients in rural Bangladesh. 
            Our platform enables quick, efficient matching of compatible donors with those in need, 
            ensuring that no life is lost due to blood shortage. Through technology and community 
            engagement, we're building a sustainable blood donation ecosystem.
          </p>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <FaHeart className="text-5xl text-red-500 mb-4" />
                <h3 className="card-title text-xl mb-2">Compassion</h3>
                <p>Every donation is an act of love and compassion for humanity.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <FaShieldAlt className="text-5xl text-blue-500 mb-4" />
                <h3 className="card-title text-xl mb-2">Trust & Safety</h3>
                <p>We maintain the highest standards of safety and privacy protection.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <FaUsers className="text-5xl text-green-500 mb-4" />
                <h3 className="card-title text-xl mb-2">Community</h3>
                <p>Building strong communities through collective action and mutual support.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="card bg-base-100 shadow-xl">
                <div className="card-body items-center text-center">
                  {achievement.icon}
                  <div className="text-3xl font-bold text-primary mt-4">
                    {achievement.number}
                  </div>
                  <h3 className="text-lg font-semibold">{achievement.label}</h3>
                  <p className="text-sm text-base-content/70">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="mb-16 bg-base-200 rounded-lg p-8">
          <h2 className="text-4xl font-bold text-center mb-8">Our Story</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-lg text-base-content/80 leading-relaxed mb-6">
              Founded in 2023, the Blood Bank Management System was born from a personal tragedy. 
              When our founder's family member couldn't receive timely blood transfusion due to 
              communication gaps between donors and hospitals, we realized the urgent need for a 
              digital solution.
            </p>
            <p className="text-lg text-base-content/80 leading-relaxed mb-6">
              Starting as a small community initiative in Chittagong, we've grown into a 
              comprehensive platform serving rural Bangladesh. Our technology-driven approach 
              has revolutionized how blood donation works in underserved areas, making it 
              faster, more reliable, and accessible to everyone.
            </p>
            <p className="text-lg text-base-content/80 leading-relaxed">
              Today, we continue to innovate and expand our reach, always keeping our core 
              mission at heart: ensuring that distance and lack of information never prevent 
              someone from receiving life-saving blood when they need it most.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="card bg-base-100 shadow-xl">
                <figure className="px-6 pt-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="rounded-full w-32 h-32 object-cover"
                  />
                </figure>
                <div className="card-body items-center text-center">
                  <h3 className="card-title text-lg">{member.name}</h3>
                  <p className="text-primary font-semibold">{member.role}</p>
                  <p className="text-sm text-base-content/70">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Awards Section */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">Recognition & Awards</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <FaAward className="text-5xl text-yellow-500 mb-4" />
                <h3 className="card-title">Healthcare Innovation Award 2024</h3>
                <p className="text-base-content/70">Ministry of Health & Family Welfare</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <FaAward className="text-5xl text-gray-400 mb-4" />
                <h3 className="card-title">Community Service Excellence</h3>
                <p className="text-base-content/70">Chittagong Chamber of Commerce</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <FaAward className="text-5xl text-orange-600 mb-4" />
                <h3 className="card-title">Digital Health Pioneer</h3>
                <p className="text-base-content/70">Bangladesh Computer Society</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="card bg-gradient-to-r from-primary to-secondary text-primary-content shadow-xl">
          <div className="card-body text-center">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="mb-6 text-lg">
              Have questions about our mission or want to partner with us? 
              We'd love to hear from you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="mailto:info@bloodbank.org" className="btn btn-accent">
                Email Us
              </a>
              <a href="tel:+8801234567890" className="btn btn-accent btn-outline">
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
