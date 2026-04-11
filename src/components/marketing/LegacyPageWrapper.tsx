import React from "react";
import LegacyPageBanner from "./LegacyPageBanner";

interface LegacyPageWrapperProps {
  newPath: string;
  newPageName: string;
  children: React.ReactNode;
}

const LegacyPageWrapper = ({ newPath, newPageName, children }: LegacyPageWrapperProps) => {
  return (
    <>
      <div className="px-4 pt-4 md:px-6 md:pt-6">
        <LegacyPageBanner newPath={newPath} newPageName={newPageName} />
      </div>
      {children}
    </>
  );
};

export default LegacyPageWrapper;
