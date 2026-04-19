export const getDefaultListFormInput = (onChange) => [
  {
    type: "text",
    id: "destinationAppFolder",
    onChange,
    btnGroup: {
      type: "file",
    },
  },
  {
    type: "text",
    id: "configFolder",
    onChange,
    btnGroup: {
      type: "folder",
    },
  },
];
