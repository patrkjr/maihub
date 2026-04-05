import { useParams } from 'react-router-dom';

const NicheAppPage = ({ nicheApps }) => {
  const { appId } = useParams();
  const currentApp = nicheApps.find((app) => app.id === appId);

  if (!currentApp) {
    return (
      <div className="text-slate-500 dark:text-slate-400 animate-in fade-in duration-300">
        App not found.
      </div>
    );
  }

  const { Component } = currentApp;
  return <Component appId={currentApp.id} />;
};

export default NicheAppPage;
