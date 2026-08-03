import { AccessTime, ArrowForward, Place } from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import { Link } from "react-router";
import AvatarPopover from "../../../app/shared/components/AvatarPopover";

type Props = {
  activity: Activity;
};

/** One accent per seeded category; anything unknown falls back to the brand teal. */
const categoryAccents: Record<string, string> = {
  drinks: "#B4692F",
  culture: "#6C4FB6",
  film: "#2F3E6E",
  music: "#C2456B",
  travel: "#1B8F94",
};

const ink = "#0F1B3D";
const muted = "#5A6785";
const hairline = "#E6EAF2";

const metaLabel = {
  fontSize: "0.6875rem",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
} as const;

export default function ActivityCard({ activity }: Props) {
  const label = activity.isHost
    ? "You are hosting"
    : activity.isGoing
      ? "You are going"
      : null;
  const color = activity.isHost
    ? "secondary"
    : activity.isGoing
      ? "warning"
      : "default";

  const isCancelled = activity.isCancelled;
  const accent = isCancelled
    ? muted
    : (categoryAccents[activity.category?.toLowerCase()] ?? "#218AAE");

  const start = new Date(activity.date);
  const hasValidDate = !Number.isNaN(start.getTime());
  const month = hasValidDate
    ? start.toLocaleString("en-US", { month: "short" }).toUpperCase()
    : "TBD";
  const day = hasValidDate ? start.getDate() : "--";
  const startsAt = hasValidDate
    ? start.toLocaleString("en-US", {
        weekday: "long",
        hour: "numeric",
        minute: "2-digit",
      })
    : activity.date;
  const location = [activity.venue, activity.city].filter(Boolean).join(", ");

  return (
    <Card
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",
        borderRadius: 3,
        border: `1px solid ${hairline}`,
        pl: "5px",
        backgroundColor: "#fff",
        transition: "transform 160ms ease, box-shadow 160ms ease",
        "&::before": {
          content: '""',
          position: "absolute",
          insetBlock: 0,
          left: 0,
          width: "5px",
          backgroundColor: accent,
        },
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 12px 28px -18px rgba(15, 27, 61, 0.45)",
        },
        "&:focus-within": {
          boxShadow: `0 0 0 3px ${accent}33`,
        },
        "@media (prefers-reduced-motion: reduce)": {
          transition: "none",
          "&:hover": { transform: "none" },
        },
      }}
    >
      <CardContent sx={{ p: 3, pb: 2 }}>
        <Stack direction="row" sx={{ gap: 2.5, alignItems: "flex-start" }}>
          {/* Date stub — the card's anchor, and why the raw ISO string never shows. */}
          <Box
            sx={{
              flexShrink: 0,
              width: 60,
              textAlign: "center",
              borderRadius: 2,
              border: `1px solid ${hairline}`,
              py: 1,
            }}
          >
            <Typography
              sx={{ ...metaLabel, fontSize: "0.625rem", color: accent }}
            >
              {month}
            </Typography>
            <Typography
              sx={{
                fontSize: "1.5rem",
                fontWeight: 700,
                lineHeight: 1.1,
                color: ink,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {day}
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography sx={{ ...metaLabel, color: accent, mb: 0.5 }}>
              {activity.category}
            </Typography>
            <Typography
              component="h3"
              sx={{
                fontSize: "1.375rem",
                fontWeight: 600,
                letterSpacing: "-0.01em",
                lineHeight: 1.25,
                color: ink,
                textDecoration: isCancelled ? "line-through" : "none",
              }}
            >
              {activity.title}
            </Typography>

            <Stack
              direction="row"
              sx={{ alignItems: "center", gap: 1, mt: 1.25 }}
            >
              <Avatar sx={{ width: 26, height: 26, fontSize: "0.75rem" }} />
              <Typography sx={{ fontSize: "0.875rem", color: muted }}>
                Hosted by{" "}
                <Box
                  component={Link}
                  to={`/profiles/${activity.hostId}`}
                  sx={{
                    color: ink,
                    fontWeight: 600,
                    textDecoration: "none",
                    "&:hover": { textDecoration: "underline" },
                  }}
                >
                  {activity.hostDisplayName}
                </Box>
              </Typography>
            </Stack>
          </Box>

          <Stack sx={{ gap: 1, alignItems: "flex-end", flexShrink: 0 }}>
            {isCancelled && (
              <Chip
                label="Cancelled"
                size="small"
                sx={{
                  ...metaLabel,
                  borderRadius: 1.5,
                  color: "#8E2A3F",
                  backgroundColor: "#FBE9ED",
                }}
              />
            )}
            {(activity.isHost || activity.isGoing) && (
              <Chip
                label={label}
                color={color}
                size="small"
                sx={{
                  ...metaLabel,
                  borderRadius: 1.5,
                  color: activity.isHost ? "#6B5613" : ink,
                  backgroundColor: activity.isHost ? "#F9E8A2" : "#E8F3F6",
                }}
              />
            )}
          </Stack>
        </Stack>

        <Stack
          direction="row"
          sx={{ flexWrap: "wrap", gap: 2.5, mt: 2.5, color: muted }}
        >
          <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
            <AccessTime sx={{ fontSize: 18 }} />
            <Typography sx={{ fontSize: "0.875rem" }}>{startsAt}</Typography>
          </Stack>
          {location && (
            <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
              <Place sx={{ fontSize: 18 }} />
              <Typography sx={{ fontSize: "0.875rem" }}>{location}</Typography>
            </Stack>
          )}
        </Stack>

        {activity.description && (
          <Typography
            sx={{
              mt: 2,
              fontSize: "0.9375rem",
              lineHeight: 1.6,
              color: muted,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {activity.description}
          </Typography>
        )}
      </CardContent>

      <Divider sx={{ borderColor: hairline }} />

      <CardActions
        sx={{
          px: 3,
          py: 1.5,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            py: 3,
            pl: 3,
            backgroundColor: "grey.200",
          }}
        >
          {activity.attendees.map((attendee) => (
            <AvatarPopover key={attendee.id} profile={attendee} />
          ))}
        </Box>
        <Button
          component={Link}
          to={`/activities/${activity.id}`}
          endIcon={<ArrowForward />}
          sx={{
            ...metaLabel,
            borderRadius: 2,
            px: 2,
            color: "#fff",
            backgroundColor: ink,
            "&:hover": { backgroundColor: "#1B2C5E" },
          }}
        >
          View
        </Button>
      </CardActions>
    </Card>
  );
}
