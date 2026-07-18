using System;
using Domain;
using MediatR;
using Persistence;

namespace Application.Activities.Commands;

public class EditActivity
{
    public class Command : IRequest
    {
        public required Activity Activity { get; set; }
    }

    public class Handler(AppDbContext context) : IRequestHandler<Command>
    {
        public async Task Handle(Command request, CancellationToken cancellationToken)
        {
            var activity = await context.Activities
            .FindAsync([request.Activity.Id], cancellationToken)
            ?? throw new Exception("Activity not found");

           
            activity.Title = request.Activity.Title;
            activity.Description = request.Activity.Description;
            activity.Category = request.Activity.Category;
            activity.Date = request.Activity.Date;
            activity.City = request.Activity.City;
            activity.Venue = request.Activity.Venue;
            activity.IsCancelled = request.Activity.IsCancelled;
            activity.Latitude = request.Activity.Latitude;
            activity.Longitude = request.Activity.Longitude;

            await context.SaveChangesAsync(cancellationToken);
        }
    }

}