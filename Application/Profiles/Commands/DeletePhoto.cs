using Application.Core;
using Application.Interfaces;
using MediatR;
using Persistence;

namespace Application.Profiles.Commands;

public class DeletePhoto
{
    public class Command : IRequest<Result<Unit>>
    {
        public required string PhotoId { get; set; }
    }

    public class Handler(
        IUserAccessor userAccessor,
        AppDbContext context,
        IPhotoService photoAccessor

    ) : IRequestHandler<Command, Result<Unit>>
    {

        public async Task<Result<Unit>> Handle(Command request, CancellationToken cancellationToken)
        {
            var user = await userAccessor.GetUserWithPhotosAsync();


            var photo = user.Photos.FirstOrDefault(x => x.Id == request.PhotoId);

            if (photo == null) return Result<Unit>.Failure("Photo not found", 404);

            if (photo.Url == user.ImageUrl) return Result<Unit>.Failure("You cannot delete your main photo", 400);

            var result = await photoAccessor.DeletePhoto(photo.publicId);
            if (result == null) return Result<Unit>.Failure("Problem deleting photo from cloudinary", 400);

            // Photo.UserId is optional, so removing from the collection only severs
            // the relationship (FK set to null) and leaves the row behind.
            context.Photos.Remove(photo);

            var success = await context.SaveChangesAsync(cancellationToken) > 0;

            return success ? Result<Unit>.Success(Unit.Value)
                : Result<Unit>.Failure("Problem deleting photo from database", 400);
        }
    }

}