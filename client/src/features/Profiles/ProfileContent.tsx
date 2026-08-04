import { Box, Paper, Tab, Tabs } from "@mui/material";
import { useState, type SyntheticEvent } from "react";
import ProfilePhotos from "./ProfilePhotos";
import ProfileAbout from "./ProfileAbout";

export default function ProfileContent() {
  const [value, setValue] = useState(0);

  const handleChange = (_: SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const tabContent = [
    { label: "About", content: <ProfileAbout /> },
    { label: "Photos", content: <ProfilePhotos /> },
    { label: "Event", content: <div> Events</div> },
    { label: "Followers", content: <div> Followers</div> },
    { label: "Following", content: <div> Following</div> },
  ];

  return (
    <Box
      component={Paper}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        borderRadius: 3,
        mt: 2,
      }}
    >
      <Tabs
        orientation="vertical"
        value={value}
        onChange={handleChange}
        sx={{
          borderRadius: 1,
          height: 450,
          minWidth: 200,
        }}
      >
        {tabContent.map((tab, index) => (
          <Tab
            key={index}
            label={tab.label}
            sx={{
              mr: 3,
            }}
          />
        ))}
      </Tabs>
      {/* The panel is a sibling of Tabs, not a child of Tab: MUI renders Tab as a
          button, and Tabs only accepts Tab children. */}
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      >
        {tabContent[value].content}
      </Box>
    </Box>
  );
}
