import React from 'react';
import ReactDOM from 'react-dom/client';
import AeroShards from './AeroShards';

const mountNode = document.getElementById('aero-shards-root');
if (mountNode) {
  ReactDOM.createRoot(mountNode).render(
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <AeroShards
        backgroundColor="#ffffff"
        shardColor="#0F4FAD"
        accentColor="#1868DB"
        placement="full"
        flow="stream"
        material="pearl"
        detail="balanced"
        effect="none"
        scale={1.05}
        spread={1}
        depth={1}
        speed={1}
        spin={1}
        interaction="repel"
        density={1.5}
        shardSize={1.1}
        stretch={1}
        turbulence={1}
        glow={1}
        edgeSoftness={2}
        bloom={0.5}
        grain={0.05}
        chromaticAberration={0.0075}
        transitionDuration={1}
        interactionRadius={1.5}
        interactionStrength={0.5}
        rippleIntensity={0.15}
        holdToGather={false}
        paused={false}
      />
    </div>
  );
}
