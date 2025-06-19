import React from 'react';
import { Link } from 'react-router';
import { FaHeart, FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-200 text-base-content">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <FaHeart className="text-red-500 text-2xl mr-2" />
              <span className="text-2xl font-bold">BloodBank</span>
            </div>
            <p className="text-base-content/80 mb-4 leading-relaxed">
              Connecting blood donors with recipients in rural Chittagong.
              Together, we save lives through voluntary blood donation.
            </p>
            <div className="flex space-x-3">
              <a 
                href="#" 
                className="btn btn-circle btn-ghost hover:btn-primary"
                aria-label="Facebook"
              >
                <FaFacebook className="text-xl" />
              </a>
              <a 
                href="#" 
                className="btn btn-circle btn-ghost hover:btn-primary"
                aria-label="Twitter"
              >
                <FaTwitter className="text-xl" />
              </a>
              <a 
                href="#" 
                className="btn btn-circle btn-ghost hover:btn-primary"
                aria-label="Instagram"
              >
                <FaInstagram className="text-xl" />
              </a>
              <a 
                href="#" 
                className="btn btn-circle btn-ghost hover:btn-primary"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="text-xl" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h6 className="footer-title text-lg font-semibold mb-4">Quick Links</h6>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="link link-hover hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="link link-hover hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/donors" className="link link-hover hover:text-primary transition-colors">
                  Find Donors
                </Link>
              </li>
              <li>
                <Link to="/events" className="link link-hover hover:text-primary transition-colors">
                  Blood Drives
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h6 className="footer-title text-lg font-semibold mb-4">Services</h6>
            <ul className="space-y-2">
              <li>
                <Link to="/request" className="link link-hover hover:text-primary transition-colors">
                  Request Blood
                </Link>
              </li>
              <li>
                <Link to="/register" className="link link-hover hover:text-primary transition-colors">
                  Become Donor
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="link link-hover hover:text-primary transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="link link-hover hover:text-primary transition-colors">
                  Health Tips
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h6 className="footer-title text-lg font-semibold mb-4">Contact Info</h6>
            <div className="space-y-3">
              <div className="flex items-start">
                <FaMapMarkerAlt className="mr-3 text-primary mt-1 flex-shrink-0" />
                <div>
                  <p className="text-sm">123 Medical Street</p>
                  <p className="text-sm">Chittagong, Bangladesh</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaPhone className="mr-3 text-primary flex-shrink-0" />
                <a href="tel:+8801234567890" className="text-sm hover:text-primary transition-colors">
                  +880 1234 567890
                </a>
              </div>
              <div className="flex items-center">
                <FaEnvelope className="mr-3 text-primary flex-shrink-0" />
                <a href="mailto:info@bloodbank.org" className="text-sm hover:text-primary transition-colors">
                  info@bloodbank.org
                </a>
              </div>
            </div>

            {/* Emergency Section */}
            <div className="mt-6 p-4 bg-error/10 rounded-lg border border-error/20">
              <h6 className="font-semibold text-error mb-2">24/7 Emergency</h6>
              <a 
                href="tel:+8801234567890" 
                className="text-error font-bold hover:underline"
              >
                +880 1234 567890
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-base-300 bg-base-300">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-base-content/70">
                Copyright © {currentYear} BloodBank Management System. All rights reserved.
              </p>
              <p className="text-sm text-base-content/70">
                Made with <FaHeart className="inline text-red-500 mx-1" /> for humanity
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 text-sm">
              <Link to="/privacy" className="link link-hover hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="link link-hover hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="/cookie-policy" className="link link-hover hover:text-primary transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
