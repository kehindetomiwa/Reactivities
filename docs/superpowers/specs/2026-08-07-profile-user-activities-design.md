# Profile user activities (section 21) — design

Date: 2026-08-07

## Goal

The Events tab on a profile lists the activities that user is involved in, split
three ways by tabs: **Future Events**, **Past Events**, **Hosting**.

## Filter semantics

Derived from the target screenshots, not guessed:

| filter | rows | note |
|---|---|---|
| `future` | attendee rows where `Activity.Date >= now` | includes activities the user hosts |
| `past` | attendee rows where `Activity.Date <= now` | includes activities the user hosts |
| `hosting` | attendee rows where `IsHost` | **not** date-filtered — the Hosting screenshot shows a past activity alongside future ones |

All three are ordered by `Activity.Date` ascending, matching the screenshots.
`future` is the default when the filter is unrecognised.

## Backend

### `Application/Profiles/DTOs/UserActivityDto.cs`

`Id`, `Title`, `Category`, `Date`. Nothing else — the card only renders an image
(from category), a title and a date.

### `Application/Profiles/Queries/GetUserActivities.cs`

Follows the `GetFollowings` shape: a static wrapper with a nested
`Query : IRequest<Result<List<UserActivityDto>>>` carrying `required string UserId`
and `string Filter`, plus a `Handler(AppDbContext context, IMapper mapper)` using
primary-constructor injection.

The handler starts from `context.ActivityAttendees.Where(x => x.UserId == request.UserId)`,
narrows it with a `switch` on the filter (table above), then
`.OrderBy(x => x.Activity.Date)`, `.Select(x => x.Activity)` and
`ProjectTo<UserActivityDto>(mapper.ConfigurationProvider)` so the projection runs
in SQL. Always `Result<...>.Success` — an empty list is a valid answer, and an
unknown user id is not distinguishable from a user with no activities here.

`DateTime.UtcNow` is captured once into a local before the switch, so EF
translates a constant rather than re-evaluating per row.

### `Application/Core/MappingProfiles.cs`

`CreateMap<Activity, UserActivityDto>()` — property names line up, so no member
configuration is needed.

### `API/Controllers/ProfilesController.cs`

```csharp
[HttpGet("{userId}/activities")]
public async Task<ActionResult> GetUserActivities(string userId, string filter)
```

delegating to `Mediator.Send` and `HandleResult`, like every other action there.

## Client

### `src/lib/types/index.d.ts`

A global ambient `UserActivity` type mirroring the DTO (`id`, `title`,
`category`, `date: string`), kept in sync by hand like the other types in that file.

### `src/lib/hooks/useProfile.ts`

A third optional argument `filter?: string` and a fourth query:

- key `["user-activities", id, filter]` — the filter belongs in the key for the
  same reason `predicate` does on the followings query: without it the three tabs
  share one cache entry and show whichever list resolved first.
- `enabled: !!id && !!filter` — keeps the request from firing for every caller
  that passes only an id (ProfilePage, ProfileHeader, ProfileAbout, …), which is
  what the "only enabled on the events tab" requirement asks for.

### `src/features/profiles/ProfileActivities.tsx`

- `useState(tabs[0].filter)` for the filter. The course instructions suggest
  `useState(null)` plus a mount `useEffect` that sets the initial filter, but
  this repo's `react-hooks/set-state-in-effect` lint rule (React Compiler)
  rejects a synchronous setState in an effect. The initializer is equivalent
  here — this component only renders on the Events tab, so the query is still
  gated to that tab — and it avoids the extra render the effect would cause.
- Horizontal MUI `Tabs` — Future Events / Past Events / Hosting — mapping tab
  index to filter value.
- A flex-wrapped row of cards. Each card is a `Link` to `/activities/{id}` with
  `CardMedia` at `/images/categoryImages/{category}.jpg`, the title, and the date
  on two lines (`do MMM yyyy` then `h:mm a` via date-fns), matching the screenshots.

### `src/features/profiles/ProfileContent.tsx`

The existing placeholder tab `{ label: "Event", content: <div>Events</div> }`
becomes `{ label: "Events", content: <ProfileActivities /> }`.

## Out of scope

`ActivityDetailsHeader` hardcodes `travel.jpg` for its hero image. Real bug,
unrelated to this feature — left alone.

## Verification

No test projects exist on either side of this repo, so verification is
`dotnet build` for the backend, `npm run build` (tsc -b) and `npm run lint` for
the client, plus manually exercising the three filters against the running API.
