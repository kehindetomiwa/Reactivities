using Application.Core;
using Application.Profiles.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles.Queries;

public class GetUserActivities
{
    public class Query : IRequest<Result<List<UserActivityDto>>>
    {
        public required string UserId { get; set; }
        public string Filter { get; set; } = "future";
    }

    public class Handler(AppDbContext context, IMapper mapper)
        : IRequestHandler<Query, Result<List<UserActivityDto>>>
    {
        public async Task<Result<List<UserActivityDto>>> Handle(Query request, CancellationToken cancellationToken)
        {
            // Pulled out of the switch so EF translates a constant instead of
            // re-evaluating UtcNow per row.
            var today = DateTime.UtcNow;

            var query = context.ActivityAttendees
                .Where(x => x.UserId == request.UserId)
                .OrderBy(x => x.Activity.Date)
                .AsQueryable();

            query = request.Filter switch
            {
                "past" => query.Where(x => x.Activity.Date <= today),
                // Hosting is deliberately not date-filtered: it lists everything
                // the user hosts, past events included.
                "hosting" => query.Where(x => x.IsHost),
                _ => query.Where(x => x.Activity.Date >= today)
            };

            var activities = await query
                .Select(x => x.Activity)
                .ProjectTo<UserActivityDto>(mapper.ConfigurationProvider)
                .ToListAsync(cancellationToken);

            return Result<List<UserActivityDto>>.Success(activities);
        }
    }
}
