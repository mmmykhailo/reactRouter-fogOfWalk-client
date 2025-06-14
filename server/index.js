import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { PassThrough } from "node:stream";
import { createReadableStreamFromReadable } from "@react-router/node";
import { ServerRouter, UNSAFE_withComponentProps, Outlet, UNSAFE_withErrorBoundaryProps, isRouteErrorResponse, Meta, Links, ScrollRestoration, Scripts } from "react-router";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { lazy, Suspense, useState, useRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { Stream, Decoder } from "@garmin/fitsdk";
import { XMLParser } from "fast-xml-parser";
const streamTimeout = 5e3;
function handleRequest(request, responseStatusCode, responseHeaders, routerContext, loadContext) {
  return new Promise((resolve, reject) => {
    let shellRendered = false;
    let userAgent = request.headers.get("user-agent");
    let readyOption = userAgent && isbot(userAgent) || routerContext.isSpaMode ? "onAllReady" : "onShellReady";
    const { pipe, abort } = renderToPipeableStream(
      /* @__PURE__ */ jsx(ServerRouter, { context: routerContext, url: request.url }),
      {
        [readyOption]() {
          shellRendered = true;
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);
          responseHeaders.set("Content-Type", "text/html");
          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: responseStatusCode
            })
          );
          pipe(body);
        },
        onShellError(error) {
          reject(error);
        },
        onError(error) {
          responseStatusCode = 500;
          if (shellRendered) {
            console.error(error);
          }
        }
      }
    );
    setTimeout(abort, streamTimeout + 1e3);
  });
}
const entryServer = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: handleRequest,
  streamTimeout
}, Symbol.toStringTag, { value: "Module" }));
const links = () => [{
  rel: "preconnect",
  href: "https://fonts.googleapis.com"
}, {
  rel: "preconnect",
  href: "https://fonts.gstatic.com",
  crossOrigin: "anonymous"
}, {
  rel: "stylesheet",
  href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap"
}];
function Layout({
  children
}) {
  return /* @__PURE__ */ jsxs("html", {
    lang: "en",
    children: [/* @__PURE__ */ jsxs("head", {
      children: [/* @__PURE__ */ jsx("meta", {
        charSet: "utf-8"
      }), /* @__PURE__ */ jsx("meta", {
        name: "viewport",
        content: "width=device-width, initial-scale=1"
      }), /* @__PURE__ */ jsx(Meta, {}), /* @__PURE__ */ jsx(Links, {})]
    }), /* @__PURE__ */ jsxs("body", {
      children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})]
    })]
  });
}
const root = UNSAFE_withComponentProps(function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
});
const ErrorBoundary = UNSAFE_withErrorBoundaryProps(function ErrorBoundary2({
  error
}) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack;
  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details = error.status === 404 ? "The requested page could not be found." : error.statusText || details;
  }
  return /* @__PURE__ */ jsxs("main", {
    className: "pt-16 p-4 container mx-auto",
    children: [/* @__PURE__ */ jsx("h1", {
      children: message
    }), /* @__PURE__ */ jsx("p", {
      children: details
    }), stack]
  });
});
const route0 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ErrorBoundary,
  Layout,
  default: root,
  links
}, Symbol.toStringTag, { value: "Module" }));
const LazyMap = lazy(() => import("./assets/map-AKdpbgZE.js"));
const DynamicMap = (props) => {
  return /* @__PURE__ */ jsx(Suspense, { fallback: /* @__PURE__ */ jsx("div", { children: "Loading map..." }), children: /* @__PURE__ */ jsx(LazyMap, { ...props }) });
};
function cn(...inputs) {
  return twMerge(clsx(inputs));
}
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive: "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);
function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}) {
  const Comp = asChild ? Slot : "button";
  return /* @__PURE__ */ jsx(
    Comp,
    {
      "data-slot": "button",
      className: cn(buttonVariants({ variant, size, className })),
      ...props
    }
  );
}
function Dialog({
  ...props
}) {
  return /* @__PURE__ */ jsx(DialogPrimitive.Root, { "data-slot": "dialog", ...props });
}
function DialogPortal({
  ...props
}) {
  return /* @__PURE__ */ jsx(DialogPrimitive.Portal, { "data-slot": "dialog-portal", ...props });
}
function DialogOverlay({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DialogPrimitive.Overlay,
    {
      "data-slot": "dialog-overlay",
      className: cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      ),
      ...props
    }
  );
}
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}) {
  return /* @__PURE__ */ jsxs(DialogPortal, { "data-slot": "dialog-portal", children: [
    /* @__PURE__ */ jsx(DialogOverlay, {}),
    /* @__PURE__ */ jsxs(
      DialogPrimitive.Content,
      {
        "data-slot": "dialog-content",
        className: cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg",
          className
        ),
        ...props,
        children: [
          children,
          showCloseButton && /* @__PURE__ */ jsxs(
            DialogPrimitive.Close,
            {
              "data-slot": "dialog-close",
              className: "ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
              children: [
                /* @__PURE__ */ jsx(XIcon, {}),
                /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
              ]
            }
          )
        ]
      }
    )
  ] });
}
function DialogHeader({ className, ...props }) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      "data-slot": "dialog-header",
      className: cn("flex flex-col gap-2 text-center sm:text-left", className),
      ...props
    }
  );
}
function DialogTitle({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DialogPrimitive.Title,
    {
      "data-slot": "dialog-title",
      className: cn("text-lg leading-none font-semibold", className),
      ...props
    }
  );
}
function DialogDescription({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    DialogPrimitive.Description,
    {
      "data-slot": "dialog-description",
      className: cn("text-muted-foreground text-sm", className),
      ...props
    }
  );
}
function Input({ className, type, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      type,
      "data-slot": "input",
      className: cn(
        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        className
      ),
      ...props
    }
  );
}
async function parseFitFiles(files) {
  const tracks = [];
  for (const file of files) {
    try {
      const track = await parseSingleFitFile(file);
      if (track) {
        tracks.push(track);
      }
    } catch (error) {
      console.error(`Error parsing file ${file.name}:`, error);
    }
  }
  return tracks;
}
async function parseSingleFitFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result;
        const stream = Stream.fromArrayBuffer(arrayBuffer);
        const decoder = new Decoder(stream);
        const { messages } = decoder.read();
        const points = [];
        let trackName;
        let trackType;
        let trackSource;
        let trackTime;
        if (messages.recordMesgs) {
          messages.recordMesgs.forEach((record) => {
            if (record.positionLat !== void 0 && record.positionLong !== void 0) {
              const lat = record.positionLat * (180 / Math.pow(2, 31));
              const lon = record.positionLong * (180 / Math.pow(2, 31));
              if (lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
                points.push([lat, lon]);
              }
            }
          });
        }
        if (messages.sessionMesgs && messages.sessionMesgs.length > 0) {
          const session = messages.sessionMesgs[0];
          if (session.sport) {
            trackType = session.sport;
            if (session.subSport) {
              trackType += `_${session.subSport}`;
            }
          }
          if (session.startTime) {
            trackTime = session.startTime;
          }
        }
        if (messages.fileIdMesgs && messages.fileIdMesgs.length > 0) {
          const fileId = messages.fileIdMesgs[0];
          if (fileId.manufacturer) {
            trackSource = fileId.manufacturer;
          }
          if (fileId.timeCreated && !trackTime) {
            trackTime = fileId.timeCreated;
          }
        }
        if (messages.activityMesgs && messages.activityMesgs.length > 0) {
          const activity = messages.activityMesgs[0];
          if (activity.timestamp && !trackTime) {
            trackTime = activity.timestamp;
          }
        }
        if (points.length === 0) {
          console.warn(`No GPS points found in file: ${file.name}`);
          resolve(null);
          return;
        }
        trackName = file.name.replace(/\.[^/.]+$/, "");
        if (trackType && trackTime) {
          const dateStr = trackTime.toISOString().split("T")[0];
          trackName = `${trackType}_${dateStr}`;
        }
        const track = {
          filename: file.name,
          name: trackName,
          type: trackType,
          source: trackSource,
          time: trackTime,
          points
        };
        resolve(track);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${file.name}`));
    };
    reader.readAsArrayBuffer(file);
  });
}
async function parseSingleGpxFile(parser, file) {
  var _a, _b, _c, _d;
  const fileContent = await file.text();
  const { gpx } = parser.parse(fileContent);
  if (!gpx.trk) {
    console.log("GPX file contains no tracks!", file.name);
    return [];
  }
  const tracksInGpx = Array.isArray(gpx.trk) ? gpx.trk : [gpx.trk];
  const parsedTracks = [];
  for (const trk of tracksInGpx) {
    if (!trk || !trk.trkseg) {
      continue;
    }
    const points = [];
    const segments = Array.isArray(trk.trkseg) ? trk.trkseg : [trk.trkseg];
    for (const seg of segments) {
      if (seg && seg.trkpt) {
        for (const trkpt of seg.trkpt) {
          if (((_a = trkpt == null ? void 0 : trkpt.$) == null ? void 0 : _a.lat) && ((_b = trkpt == null ? void 0 : trkpt.$) == null ? void 0 : _b.lon)) {
            points.push([parseFloat(trkpt.$.lat), parseFloat(trkpt.$.lon)]);
          }
        }
      }
    }
    if (points.length > 0) {
      parsedTracks.push({
        name: trk.name,
        type: trk.type,
        time: new Date((_c = gpx.metadata) == null ? void 0 : _c.time),
        source: (_d = gpx.$) == null ? void 0 : _d.creator,
        filename: file.name,
        points
      });
    }
  }
  return parsedTracks;
}
async function parseGpxFiles(files) {
  const parser = new XMLParser({
    attributesGroupName: "$",
    attributeNamePrefix: "",
    ignoreAttributes: false,
    parseAttributeValue: true
  });
  let tracks = [];
  for (const file of files) {
    const extractedTracks = await parseSingleGpxFile(parser, file);
    if (extractedTracks.length > 0) {
      tracks = [...tracks, ...extractedTracks];
    }
  }
  return tracks;
}
async function parseActivityFiles(files) {
  const fitFiles = [];
  const gpxFiles = [];
  for (const file of files) {
    if (file.name.toLowerCase().endsWith(".fit")) {
      fitFiles.push(file);
    } else if (file.name.toLowerCase().endsWith(".gpx")) {
      gpxFiles.push(file);
    }
  }
  const tracks = [];
  if (fitFiles.length > 0) {
    try {
      const fitTracks = await parseFitFiles(fitFiles);
      tracks.push(...fitTracks);
    } catch (error) {
      console.error("Error parsing FIT files:", error);
    }
  }
  if (gpxFiles.length > 0) {
    try {
      const gpxTracks = await parseGpxFiles(gpxFiles);
      tracks.push(...gpxTracks);
    } catch (error) {
      console.error("Error parsing GPX files:", error);
    }
  }
  return tracks;
}
function meta() {
  return [{
    title: "Fog of Walk"
  }, {
    name: "description",
    content: "Multiple fit/gpx files visualizer"
  }];
}
const home = UNSAFE_withComponentProps(function Home() {
  const [parsedTracks, setParsedTracks] = useState([]);
  const fileInputRef = useRef(null);
  const handleFileChange = async (event) => {
    const target = event.target;
    if (target.files && target.files.length > 0) {
      try {
        console.log(`Processing ${target.files.length} files...`);
        const newTracks = await parseActivityFiles(target.files);
        console.log(`Successfully parsed ${newTracks.length} tracks`);
        setParsedTracks(newTracks);
      } catch (error) {
        console.error("Error parsing files:", error);
      } finally {
        target.value = "";
      }
    }
  };
  const handleSelectFilesClick = () => {
    var _a;
    (_a = fileInputRef.current) == null ? void 0 : _a.click();
  };
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [/* @__PURE__ */ jsx(Input, {
      type: "file",
      multiple: true,
      accept: ".fit,.gpx",
      ref: fileInputRef,
      onChange: handleFileChange,
      className: "hidden"
    }), /* @__PURE__ */ jsx(Dialog, {
      open: parsedTracks.length === 0,
      children: /* @__PURE__ */ jsxs(DialogContent, {
        className: "z-50",
        showCloseButton: false,
        children: [/* @__PURE__ */ jsxs(DialogHeader, {
          children: [/* @__PURE__ */ jsx(DialogTitle, {
            children: "Please select your .fit or .gpx files"
          }), /* @__PURE__ */ jsx(DialogDescription, {
            children: "Some useless description which won't be read by anyone. It is needed just to make the app appear more complex than it actually is."
          })]
        }), /* @__PURE__ */ jsx("div", {
          className: "pt-4",
          children: /* @__PURE__ */ jsx(Button, {
            onClick: handleSelectFilesClick,
            className: "w-full",
            children: "Select Files"
          })
        })]
      })
    }), /* @__PURE__ */ jsxs("div", {
      className: "relative h-screen w-screen",
      children: [parsedTracks.length > 0 && /* @__PURE__ */ jsx(Button, {
        variant: "secondary",
        onClick: handleSelectFilesClick,
        className: "absolute top-4 right-4 z-10",
        children: "Select other files"
      }), /* @__PURE__ */ jsx(DynamicMap, {
        tracks: parsedTracks
      })]
    })]
  });
});
const route1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: home,
  meta
}, Symbol.toStringTag, { value: "Module" }));
const serverManifest = { "entry": { "module": "/assets/entry.client-D2ZsLjzA.js", "imports": ["/assets/chunk-NL6KNZEE-tAFolHIg.js", "/assets/index-1xb8rDUg.js"], "css": [] }, "routes": { "root": { "id": "root", "parentId": void 0, "path": "", "index": void 0, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": true, "module": "/assets/root-CUN2Gh5B.js", "imports": ["/assets/chunk-NL6KNZEE-tAFolHIg.js", "/assets/index-1xb8rDUg.js"], "css": ["/assets/root-O0h1SEoZ.css"], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 }, "routes/home": { "id": "routes/home", "parentId": "root", "path": void 0, "index": true, "caseSensitive": void 0, "hasAction": false, "hasLoader": false, "hasClientAction": false, "hasClientLoader": false, "hasClientMiddleware": false, "hasErrorBoundary": false, "module": "/assets/home-Dui0Gxs0.js", "imports": ["/assets/chunk-NL6KNZEE-tAFolHIg.js", "/assets/index-1xb8rDUg.js"], "css": [], "clientActionModule": void 0, "clientLoaderModule": void 0, "clientMiddlewareModule": void 0, "hydrateFallbackModule": void 0 } }, "url": "/assets/manifest-6fc20070.js", "version": "6fc20070", "sri": void 0 };
const assetsBuildDirectory = "build\\client";
const basename = "/";
const future = { "unstable_middleware": false, "unstable_optimizeDeps": false, "unstable_splitRouteModules": false, "unstable_subResourceIntegrity": false, "unstable_viteEnvironmentApi": false };
const ssr = true;
const isSpaMode = false;
const prerender = [];
const routeDiscovery = { "mode": "lazy", "manifestPath": "/__manifest" };
const publicPath = "/";
const entry = { module: entryServer };
const routes = {
  "root": {
    id: "root",
    parentId: void 0,
    path: "",
    index: void 0,
    caseSensitive: void 0,
    module: route0
  },
  "routes/home": {
    id: "routes/home",
    parentId: "root",
    path: void 0,
    index: true,
    caseSensitive: void 0,
    module: route1
  }
};
export {
  serverManifest as assets,
  assetsBuildDirectory,
  basename,
  entry,
  future,
  isSpaMode,
  prerender,
  publicPath,
  routeDiscovery,
  routes,
  ssr
};
