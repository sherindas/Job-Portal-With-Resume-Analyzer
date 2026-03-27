import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiLinkedin, FiTwitter } from 'react-icons/fi';
import Logo from './Logo';

const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

function FooterLink({ to, children }) {
  return (
    <li>
      <Link to={to} onClick={scrollTop} className="hover:text-white transition-colors">
        {children}
      </Link>
    </li>
  );
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <Logo to="/" size="sm" variant="dark" />
            <p className="text-sm leading-relaxed mt-4">
              Connecting talent with opportunity. Find your dream job or hire the best candidates.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="https://twitter.com" target="_blank" rel="noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <FiTwitter size={14} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors">
                <FiLinkedin size={14} />
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer"
                className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors">
                <FiGithub size={14} />
              </a>
            </div>
          </div>

          {/* Job Seekers */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">For Job Seekers</h4>
            <ul className="space-y-2 text-sm">
              <FooterLink to="/jobs">Browse Jobs</FooterLink>
              <FooterLink to="/register">Create Account</FooterLink>
              <FooterLink to="/resume-analyzer">Resume Analyzer</FooterLink>
              <FooterLink to="/saved-jobs">Saved Jobs</FooterLink>
              <FooterLink to="/dashboard">Dashboard</FooterLink>
            </ul>
          </div>

          {/* Recruiters */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">For Recruiters</h4>
            <ul className="space-y-2 text-sm">
              <FooterLink to="/recruiter/register">Post a Job</FooterLink>
              <FooterLink to="/recruiter/login">Recruiter Login</FooterLink>
              <FooterLink to="/recruiter/dashboard">Dashboard</FooterLink>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><span className="cursor-default">About Us</span></li>
              <li><span className="cursor-default">Privacy Policy</span></li>
              <li><span className="cursor-default">Terms of Service</span></li>
              <li><span className="cursor-default">Contact</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
          <p>© {new Date().getFullYear()} Jobly. All rights reserved.</p>
          <p>Built with ❤️ using MERN Stack</p>
        </div>
      </div>
    </footer>
  );
}
