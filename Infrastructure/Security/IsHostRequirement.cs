using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Persistence;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Security;


public class IsHostRequirement : IAuthorizationRequirement
{

}

public class IsHostRequirementHandler(AppDbContext dbContext, IHttpContextAccessor httpContextAccessor) : AuthorizationHandler<IsHostRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, IsHostRequirement requirement)
    {
        var userId = context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null)return;
        
        var httpContext = httpContextAccessor.HttpContext;

        if(httpContext?.GetRouteValue("id") is not string activityId) return;
        var attendee = await dbContext.ActivityAttendees
        .AsNoTracking()
        .SingleOrDefaultAsync(x => x.UserId == userId && x.ActivityId == activityId);

        if (attendee == null) return;
        if (attendee.IsHost) context.Succeed(requirement);

    }

    private bool CheckIfUserIsHost(string userId, string activityId)
    {
        // Implement your logic to check if the user is the host of the activity
        // This could involve querying your database or any other data source
        // For now, we'll just return false as a placeholder
        return false;
    }
}