function CdnIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M16 40 Q10 40 10 34 Q10 28 16 28 Q18 20 28 20 Q38 20 40 28 Q50 28 50 34 Q50 40 44 40 Z"
        fill="#3b7fc1"
        stroke="#1a5590"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M30 24 L22 36 L28 36 L25 46 L35 32 L29 32 L32 24 Z"
        fill="#f4b942"
        stroke="#b87e1f"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LoadBalancerIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <polygon
        points="32,6 58,32 32,58 6,32"
        fill="#3b7fc1"
        stroke="#1a5590"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M24 28 L32 20 L40 28 M32 20 L32 32"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M24 36 L32 44 L40 36 M32 32 L32 44"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M14 14 L14 50 Q14 55 32 55 Q50 55 50 50 L50 14 Z"
        fill="#3b7fc1"
        stroke="#1a5590"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <ellipse cx="32" cy="14" rx="18" ry="5" fill="#4a90d0" stroke="#1a5590" strokeWidth="1.5" />
      <path d="M14 26 Q14 31 32 31 Q50 31 50 26" fill="none" stroke="#ffffff" strokeWidth="1.2" />
      <path d="M14 38 Q14 43 32 43 Q50 43 50 38" fill="none" stroke="#ffffff" strokeWidth="1.2" />
    </svg>
  );
}

function QueueIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g fill="#ffffff" stroke="#3b7fc1" strokeWidth="2" strokeLinejoin="round">
        <path d="M6 22 L18 22 L24 32 L18 42 L6 42 L12 32 Z" />
        <path d="M22 22 L34 22 L40 32 L34 42 L22 42 L28 32 Z" />
        <path d="M38 22 L50 22 L56 32 L50 42 L38 42 L44 32 Z" />
      </g>
    </svg>
  );
}

function ServerRackIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g fill="#5fa770" stroke="#2f7347" strokeWidth="1.5">
        <rect x="14" y="14" width="36" height="12" rx="2" />
        <rect x="14" y="28" width="36" height="12" rx="2" />
        <rect x="14" y="42" width="36" height="12" rx="2" />
      </g>
      <g fill="#ffffff">
        <circle cx="20" cy="20" r="1.5" />
        <circle cx="20" cy="34" r="1.5" />
        <circle cx="20" cy="48" r="1.5" />
      </g>
    </svg>
  );
}

function CacheIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g fill="#3b7fc1" stroke="#1a5590" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M12 20 L48 20 L52 16 L16 16 Z" />
        <path d="M48 20 L48 44 L52 40 L52 16 Z" />
        <rect x="12" y="20" width="36" height="24" />
      </g>
      <text
        x="30"
        y="36"
        textAnchor="middle"
        fontSize="10"
        fontFamily="sans-serif"
        fontWeight="700"
        fill="#ffffff"
      >
        CACHE
      </text>
    </svg>
  );
}

function ObjectStorageIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path
        d="M16 22 L32 14 L48 22 L48 46 L32 54 L16 46 Z"
        fill="#3b7fc1"
        stroke="#1a5590"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M16 22 L32 30 L48 22" fill="none" stroke="#1a5590" strokeWidth="1.5" />
      <path d="M32 30 L32 54" fill="none" stroke="#1a5590" strokeWidth="1.5" />
      <circle cx="26" cy="38" r="2" fill="#ffffff" />
      <rect x="30" y="36" width="10" height="4" fill="#ffffff" />
    </svg>
  );
}

function WebSocketIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="22" fill="#3b7fc1" stroke="#1a5590" strokeWidth="1.5" />
      <path
        d="M18 40 L26 26 L32 34 L40 22 L46 32"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="18" cy="40" r="2" fill="#ffffff" />
      <circle cx="46" cy="32" r="2" fill="#ffffff" />
    </svg>
  );
}

function PubSubIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="8" fill="#3b7fc1" stroke="#1a5590" strokeWidth="1.5" />
      <g fill="none" stroke="#1a5590" strokeWidth="1.5">
        <path d="M32 24 L32 10" />
        <path d="M32 40 L32 54" />
        <path d="M24 32 L10 32" />
        <path d="M40 32 L54 32" />
      </g>
      <g fill="#5fa770" stroke="#2f7347" strokeWidth="1">
        <rect x="26" y="4" width="12" height="8" rx="1" />
        <rect x="26" y="52" width="12" height="8" rx="1" />
        <rect x="4" y="28" width="12" height="8" rx="1" />
        <rect x="48" y="28" width="12" height="8" rx="1" />
      </g>
    </svg>
  );
}

function FanoutWorkerIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g fill="#5fa770" stroke="#2f7347" strokeWidth="1.5">
        <rect x="6" y="28" width="16" height="12" rx="2" />
      </g>
      <g fill="none" stroke="#3b7fc1" strokeWidth="1.8" strokeLinecap="round">
        <path d="M22 34 L38 20" />
        <path d="M22 34 L38 34" />
        <path d="M22 34 L38 48" />
      </g>
      <g fill="#3b7fc1" stroke="#1a5590" strokeWidth="1.2">
        <rect x="40" y="14" width="18" height="12" rx="2" />
        <rect x="40" y="28" width="18" height="12" rx="2" />
        <rect x="40" y="42" width="18" height="12" rx="2" />
      </g>
    </svg>
  );
}

function RateLimiterIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="34" r="22" fill="#ffffff" stroke="#1a5590" strokeWidth="2" />
      <path d="M32 34 L32 18" stroke="#e94f37" strokeWidth="3" strokeLinecap="round" />
      <path d="M32 34 L46 34" stroke="#1a5590" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="34" r="2.5" fill="#1a5590" />
      <g fill="#1a5590">
        <circle cx="32" cy="16" r="1.2" />
        <circle cx="50" cy="34" r="1.2" />
        <circle cx="14" cy="34" r="1.2" />
        <circle cx="32" cy="52" r="1.2" />
      </g>
    </svg>
  );
}

function ConsistentHashIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="32" r="20" fill="none" stroke="#1a5590" strokeWidth="2" strokeDasharray="4 3" />
      <g fill="#3b7fc1" stroke="#1a5590" strokeWidth="1.5">
        <circle cx="32" cy="12" r="4" />
        <circle cx="52" cy="32" r="4" />
        <circle cx="32" cy="52" r="4" />
        <circle cx="12" cy="32" r="4" />
      </g>
      <g fill="#5fa770" stroke="#2f7347" strokeWidth="1">
        <circle cx="46" cy="18" r="3" />
        <circle cx="46" cy="46" r="3" />
        <circle cx="18" cy="46" r="3" />
        <circle cx="18" cy="18" r="3" />
      </g>
    </svg>
  );
}

function KeyValueStoreIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g fill="#3b7fc1" stroke="#1a5590" strokeWidth="1.5">
        <rect x="10" y="14" width="16" height="10" rx="1.5" />
        <rect x="10" y="28" width="16" height="10" rx="1.5" />
        <rect x="10" y="42" width="16" height="10" rx="1.5" />
      </g>
      <g fill="#ffffff" stroke="#1a5590" strokeWidth="1.2">
        <rect x="32" y="14" width="22" height="10" rx="1.5" />
        <rect x="32" y="28" width="22" height="10" rx="1.5" />
        <rect x="32" y="42" width="22" height="10" rx="1.5" />
      </g>
      <g stroke="#1a5590" strokeWidth="1.2">
        <line x1="26" y1="19" x2="32" y2="19" />
        <line x1="26" y1="33" x2="32" y2="33" />
        <line x1="26" y1="47" x2="32" y2="47" />
      </g>
    </svg>
  );
}

function AnalyticsPipelineIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <g stroke="#1a5590" strokeWidth="1.5" fill="none">
        <path d="M6 44 L22 28 L34 40 L48 20 L58 26" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g fill="#3b7fc1" stroke="#1a5590" strokeWidth="1.2">
        <circle cx="6" cy="44" r="3" />
        <circle cx="22" cy="28" r="3" />
        <circle cx="34" cy="40" r="3" />
        <circle cx="48" cy="20" r="3" />
        <circle cx="58" cy="26" r="3" />
      </g>
      <g fill="#5fa770" opacity="0.3">
        <rect x="4" y="48" width="56" height="8" />
      </g>
    </svg>
  );
}

export const componentIcons = {
  cdn: CdnIcon,
  "load-balancer": LoadBalancerIcon,
  "application-service": ServerRackIcon,
  "relational-database": DatabaseIcon,
  "db-replica": DatabaseIcon,
  "object-storage": ObjectStorageIcon,
  cache: CacheIcon,
  queue: QueueIcon,
  pubsub: PubSubIcon,
  "websocket-gateway": WebSocketIcon,
  "fanout-worker": FanoutWorkerIcon,
  "rate-limiter": RateLimiterIcon,
  "consistent-hash": ConsistentHashIcon,
  "key-value-store": KeyValueStoreIcon,
  "analytics-pipeline": AnalyticsPipelineIcon
};

export function ComponentIcon({ componentId, size = 40 }) {
  const Icon = componentIcons[componentId];
  if (!Icon) {
    return null;
  }
  return (
    <span
      className="component-icon"
      style={{ display: "inline-flex", width: size, height: size }}
    >
      <Icon />
    </span>
  );
}
