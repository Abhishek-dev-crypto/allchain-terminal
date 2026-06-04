import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white px-4 py-3 border-t border-gray-700">
      <div className="flex flex-col md:flex-row md:justify-between gap-2">

        {/* Brand */}
        <div>
          <h1 className="text-sm font-semibold">
            AllChain AI Market Infrastructure
          </h1>
        </div>

        {/* Contact */}
        <div className="text-xs text-gray-300 space-y-1">
          <p>
            Support:{" "}
            <a
              href="mailto:support@allchainlabs.com"
              className="text-blue-400 hover:underline"
            >
              support@allchainlabs.com
            </a>
          </p>
        </div>
      </div>

      {/* Bottom line */}
      <div className="text-[10px] text-gray-500 mt-3 border-t border-gray-800 pt-2">
        © {new Date().getFullYear()} AllChain Labs Pvt Ltd. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;