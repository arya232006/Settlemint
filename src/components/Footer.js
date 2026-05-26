import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white p-4">
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} Settlemint. All rights reserved.</p>
                <Link to="/terms-and-conditions" className="text-blue-400 hover:underline">Terms and Conditions</Link>
            </div>
        </footer>
    );
};

export default Footer;