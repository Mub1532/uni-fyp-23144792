import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { type Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { all, createLowlight } from "lowlight";
import type { GetServerSidePropsContext } from "next";
import { useState } from "react";
import type { IconType } from "react-icons";
import {
  FaBold,
  FaCode,
  FaHeading,
  FaItalic,
  FaLink,
  FaList,
  FaListOl,
  FaMinus,
  FaQuoteRight,
  FaSave,
  FaUnderline,
} from "react-icons/fa";
import {
  defaultScrollbar,
  joinClasses,
  scrollHint,
} from "@/utils/misc/classes";

const lowlight = createLowlight(all);

const formatCommands: Record<
  string,
  (editor: Editor, selectedText: string) => void
> = {
  title: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
  subtitle: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
  bold: (e) => e.chain().focus().toggleBold().run(),
  italic: (e) => e.chain().focus().toggleItalic().run(),
  underline: (e) => e.chain().focus().toggleUnderline().run(),
  bulletPoint: (e) => e.chain().focus().toggleBulletList().run(),
  numberedBullets: (e) => e.chain().focus().toggleOrderedList().run(),
  quotes: (e) => e.chain().focus().toggleBlockquote().run(),
  codeBlock: (e) => e.chain().focus().toggleCodeBlock().run(),
  divider: (e) =>
    e.chain().focus().liftListItem("listItem").setHorizontalRule().run(),
  link: (e) => {
    const selectedText = window.getSelection()?.toString() ?? "";
    const existingHref = e.getAttributes("link").href;
    const url = prompt("URL", existingHref || selectedText);
    if (url === null) return;
    if (url === "") {
      e.chain().focus().unsetLink().run();
      return;
    }
    e.chain().focus().setLink({ href: url }).run();
  },
  saveNote: (e) => saveNote(e),
};

async function saveNote(editor: Editor) {
  console.log(editor.getJSON());
}

type Props = {
  initialContent: any;
};

export default function Notes({ initialContent }: Props) {
  const [, updateActive] = useState(0);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }), // disable default
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content:
      initialContent ??
      `<h2>Note Title Goes Here</h2><p>Content goes here...</p>`,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose dark:prose-invert outline-none border-none w-full h-full p-4 leading-none! m-0! max-w-none",
      },
    },
    onUpdate: () => updateActive((n) => n + 1),
    onSelectionUpdate: () => updateActive((n) => n + 1),
  }) as Editor;

  return (
    <div className="h-full w-full flex flex-col px-2 items-center gap-6 -mt-2 overflow-hidden">
      <NoteHeaderItems editor={editor} items={items} />
      <div className="border-x-2 border-slate-500/20 w-full md:w-3/4 lg:w-1/2  h-full flex px-4 overflow-auto">
        <EditorContent
          className="border-none! focus:border-none! w-full h-full"
          editor={editor}
        />
      </div>
    </div>
  );
}

export async function getServerSideProps({
  params,
}: GetServerSidePropsContext) {
  const test = {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: {
          level: 2,
        },
        content: [
          {
            type: "text",
            text: "Testing Note",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Hi my name is mub khan 123",
          },
        ],
      },
      {
        type: "paragraph",
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "test",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "horizontalRule",
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "divider lol",
          },
        ],
      },
    ],
  };

  return {
    props: { initialContent: test },
  };
}

interface NoteHeaderItemProps extends NoteHeaderItemPropsPlain {
  editor: Editor;
  extraClass?: string;
  defaultText?: boolean;
}

type NoteHeaderItemPropsPlain = {
  icon: IconType;
  title: string;
  newSection?: boolean;
  command: keyof typeof formatCommands;
};

class NoteHeaderItemClass {
  title: string;
  icon: IconType;
  newSection: boolean;
  command: keyof typeof formatCommands;

  constructor(options: NoteHeaderItemPropsPlain) {
    this.title = options.title;
    this.icon = options.icon;
    this.newSection = options.newSection ?? false;
    this.command = options.command;
  }
}

const items = [
  new NoteHeaderItemClass({
    title: "Title",
    icon: FaHeading,
    command: "title",
  }),
  new NoteHeaderItemClass({
    title: "Subtitle",
    icon: FaHeading,
    command: "subtitle",
  }),
  new NoteHeaderItemClass({
    title: "Bold",
    icon: FaBold,
    newSection: true,
    command: "bold",
  }),
  new NoteHeaderItemClass({
    title: "Italics",
    icon: FaItalic,
    command: "italic",
  }),
  new NoteHeaderItemClass({
    title: "Underline",
    icon: FaUnderline,
    command: "underline",
  }),
  new NoteHeaderItemClass({
    title: "Bullet Point",
    icon: FaList,
    newSection: true,
    command: "bulletPoint",
  }),
  new NoteHeaderItemClass({
    title: "Numbered Bullets",
    icon: FaListOl,
    command: "numberedBullets",
  }),
  new NoteHeaderItemClass({
    title: "Quotes",
    icon: FaQuoteRight,
    newSection: true,
    command: "quotes",
  }),
  new NoteHeaderItemClass({
    title: "Code block",
    icon: FaCode,
    command: "codeBlock",
  }),
  new NoteHeaderItemClass({
    title: "Divider",
    icon: FaMinus,
    command: "divider",
  }),
  new NoteHeaderItemClass({
    title: "Link",
    icon: FaLink,
    command: "link",
  }),
];

type props = {
  items: NoteHeaderItemClass[];
  editor: Editor;
};

function NoteHeaderItems({ items, editor }: props) {
  return (
    <div
      className={joinClasses(
        "w-full h-max min-h-12 rounded-md flex items-center px-2 bg-blue-100 dark:bg-slate-700 gap-1 overflow-hidden",
        defaultScrollbar,
      )}
    >
      <div
        className={joinClasses(
          "w-full h-full flex items-center overflow-x-auto overflow-y-hidden gap-1 my-2",
          defaultScrollbar,
          scrollHint,
        )}
      >
        {items.map((item) => (
          <NoteHeaderItem {...item} editor={editor} key={item.title} />
        ))}
      </div>
      <NoteHeaderItem
        editor={editor}
        icon={FaSave}
        title="Save"
        command="saveNote"
        extraClass="mr-0 ml-auto bg-blue-500 rounded-sm px-2 text-slate-200!"
        defaultText={false}
      />
    </div>
  );
}

function NoteHeaderItem({
  title,
  icon,
  newSection,
  command,
  editor,
  extraClass,
  defaultText = true,
}: NoteHeaderItemProps) {
  return (
    <>
      {newSection && (
        <div
          className={joinClasses(
            "h-4/6 w-0.5 dark:bg-slate-600 bg-slate-400 mx-1 shrink-0",
          )}
        />
      )}
      <button
        className={joinClasses(
          "shrink-0 h-fit min-h-8 w-fit text-blue px-1 text-sm flex items-center gap-1 hover:bg-blue-200 hover:dark:bg-slate-600 dark:hover:text-slate-200! cursor-pointer hover:rounded-sm hover:border-transparent!",
          "group/noteHeaderBar md:animate-none",
          editor?.isActive(command)
            ? "bg-blue-200 dark:bg-slate-600 rounded-md"
            : "",
          extraClass,
        )}
        onClick={() => {
          const selectedText = window.getSelection()?.toString() ?? "";
          formatCommands[command](editor, selectedText);
        }}
        type="button"
      >
        {icon({
          className: joinClasses("text-sm!"),
        })}
        <div
          className={joinClasses(
            "shrink-0 dark:group-hover/noteHeaderBar:text-slate-200! font-semibold text-xs",
            defaultText && "text-slate-500 dark:text-slate-400",
          )}
        >
          {title}
        </div>
      </button>
    </>
  );
}
