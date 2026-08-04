using System.Security.Claims;
using Application.Interfaces;
using Domain;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Infrastructure.Security;

public class UserAccessor(
    IHttpContextAccessor httpContextAccessor,
    AppDbContext context
) : IUserAccessor
{
    public async Task<User> GetUserAsync()
    {

        return await context.Users.FindAsync(GetUserId())
            ?? throw new UnauthorizedAccessException("No user logged in");
    }

    public string GetUserId()
    {
        return httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new Exception("User not found");
    }

    public async Task<User> GetUserWithPhotosAsync()
    {
        var userId = GetUserId();
        return await context.Users
        .Include(u => u.Photos)
        .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken: default)
            ?? throw new UnauthorizedAccessException("No user logged in");
    }
}
