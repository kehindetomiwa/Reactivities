using MediatR;
using Persistence;
using Microsoft.EntityFrameworkCore;
using Application.Activities.DTOs;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Application.Interfaces;
using Application.Core;
using Microsoft.AspNetCore.Mvc;
using Domain;


namespace Application.Activities.Queries;

public class GetActivityList
{

    public class Query : IRequest<Result<PageList<ActivityDto, DateTime?>>>
    {
        public required ActivityParams Params { get; set; }

    }

    public class Handler(AppDbContext context, IMapper mapper, IUserAccessor userAccessor)
        : IRequestHandler<Query, Result<PageList<ActivityDto, DateTime?>>>
    {

        public async Task<Result<PageList<ActivityDto, DateTime?>>> Handle(Query request, CancellationToken cancellationToken)
        {
            var query = context.Activities
                .OrderBy(x => x.Date)
                .Where(x => x.Date >= (request.Params.Cursor ?? request.Params.StartDate))
                .AsQueryable();

            if (!string.IsNullOrEmpty(request.Params.Filter))
            {
                query = request.Params.Filter switch
                {
                    "isGoing" => query.Where(x =>
                        x.Attendees.Any(a => a.UserId == userAccessor.GetUserId())),
                    "isHost" => query.Where(x =>
                        x.Attendees.Any(a => a.IsHost && a.UserId == userAccessor.GetUserId())),
                    _ => query

                };
            }

            var projectedActivities = query.ProjectTo<ActivityDto>(
                    mapper.ConfigurationProvider,
                        new { currentUserId = userAccessor.GetUserId() });


            var activities = await projectedActivities
                .Take(request.Params.PageSize + 1)
                .ToListAsync(cancellationToken);

            DateTime? nextCursor = null;
            if (activities.Count > request.Params.PageSize)
            {
                nextCursor = activities.Last().Date;
                activities.RemoveAt(activities.Count - 1);
            }

            return Result<PageList<ActivityDto, DateTime?>>.Success(
                new PageList<ActivityDto, DateTime?>
                {
                    Items = activities,
                    NextCursor = nextCursor
                }
            );
        }
    }

}
