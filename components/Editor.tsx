import {
  TDDocument,
  TDFile,
  Tldraw,
  TldrawApp,
  TldrawProps,
  useFileSystem,
} from "@tldraw/tldraw";
import { fileOpen } from "browser-fs-access";
import * as React from "react";
import { set as setToIdb } from "idb-keyval";
import * as gtag from "~utils/gtag";

declare const window: Window & { app: TldrawApp };

interface EditorProps {
  id?: string;
}

const Editor = ({
  id = "home",
  ...rest
}: EditorProps & Partial<TldrawProps>) => {
  const handleMount = React.useCallback((app: TldrawApp) => {
    monkeyPatch(app);
    window.app = app;
  }, []);

  // Send events to gtag as actions.
  const handlePersist = React.useCallback(
    (_app: TldrawApp, reason?: string) => {
      gtag.event({
        action: reason ?? "",
        category: "editor",
        label: reason ?? "persist",
        value: 0,
      });
    },
    []
  );

  const fileSystemEvents = useFileSystem();

  return (
    <div className="tldraw">
      <Tldraw
        id={id}
        autofocus
        onMount={handleMount}
        onPersist={handlePersist}
        showMultiplayerMenu={false}
        {...fileSystemEvents}
        {...rest}
      />
    </div>
  );
};

function monkeyPatch(app: TldrawApp) {
  // if someone tries to drop in a v2, file, direct them elsewhere:
  // copied from https://github.com/tldraw/tldraw/blob/784b4503aa85ccd580264455bc0caed3210a39d0/packages/tldraw/src/state/TldrawApp.ts#L1488
  app.openProject = async () => {
    if (!app.isLocal) return;

    try {
      const result = await openFromFileSystem();
      if (!result) {
        throw Error();
      }

      const { fileHandle, document } = result;
      app.loadDocument(document);
      app.fileSystemHandle = fileHandle;
      app.zoomToFit();
      // @ts-expect-error - this is a private method
      app.persist({});
    } catch (e) {
      console.error(e);
    } finally {
      // @ts-expect-error - this is a private method
      app.persist({});
    }
  };

  // copied from https://github.com/tldraw/tldraw/blob/784b4503aa85ccd580264455bc0caed3210a39d0/packages/tldraw/src/state/data/filesystem.ts#L70
  async function openFromFileSystem(): Promise<null | {
    fileHandle: FileSystemFileHandle | null;
    document: TDDocument;
  }> {
    // Get the blob
    const blob = await fileOpen({
      description: "Tldraw File",
      extensions: [`.tldr`],
      multiple: false,
    });

    if (!blob) return null;

    // Get JSON from blob
    const json: string = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.readyState === FileReader.DONE) {
          resolve(reader.result as string);
        }
      };
      reader.readAsText(blob, "utf8");
    });

    // Parse
    const file: TDFile = JSON.parse(json);
    if ("tldrawFileFormatVersion" in file) {
      alert(
        // todo: update this message when we do the actual migration
        "This file was created in a newer version of tldraw. Please visit www.tldraw.com to open it."
      );
      return null;
    }

    const fileHandle = blob.handle ?? null;

    await saveFileHandle(fileHandle);

    return {
      fileHandle,
      document: file.document,
    };
  }

  // copied from https://github.com/tldraw/tldraw/blob/784b4503aa85ccd580264455bc0caed3210a39d0/packages/tldraw/src/state/data/filesystem.ts#L23
  async function saveFileHandle(fileHandle: FileSystemFileHandle | null) {
    return setToIdb(`Tldraw_file_handle_${window.location.origin}`, fileHandle);
  }
}

export default Editor;
