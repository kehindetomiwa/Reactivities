using System;
using Application.Core;
using Application.Interfaces;
using Application.Profiles.DTOs;
using AutoMapper;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles.Commands;

public class EditProfile
{
    public class Command : IRequest<Result<Unit>>
    {
        public required EditProfileDto ProfileDto { get; set; }
    }

    public class Handler(
        AppDbContext context,
        IUserAccessor userAccessor,
        IMapper mapper
    ) : IRequestHandler<Command, Result<Unit>>
    {
        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            // You can only edit your own profile, so the id comes from the token
            // rather than the request body.
            var user = await userAccessor.GetUserAsync();

            mapper.Map(request.ProfileDto, user);

            // Re-submitting unchanged values leaves the tracked entity Unchanged,
            // SaveChangesAsync returns 0 and we would report a bogus 400. Forcing
            // the state to Modified makes EF issue the UPDATE either way.
            context.Entry(user).State = EntityState.Modified;

            var success = await context.SaveChangesAsync(cancellationToken) > 0;

            return success
                ? Result<Unit>.Success(Unit.Value)
                : Result<Unit>.Failure("Failed to update the profile", 400);
        }
    }
}
