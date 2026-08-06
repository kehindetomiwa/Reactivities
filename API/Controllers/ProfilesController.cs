using Application.Profiles.Queries;
using Application.Profiles.Commands;
using Domain;
using Microsoft.AspNetCore.Mvc;
using Application.Profiles.DTOs;
using System.Reflection.Metadata;

namespace API.Controllers;


public class ProfilesController : BaseApiController
{
    // Take IFormFile directly: [ApiController] infers [FromBody] for a complex
    // parameter, so binding AddPhoto.Command would reject the multipart upload.
    [HttpPost("add-photo")]
    public async Task<ActionResult<Photo>> AddPhoto(IFormFile file)
    {
        return HandleResult(await Mediator.Send(new AddPhoto.Command { File = file }));
    }

    [HttpGet("{userId}/photos")]
    public async Task<ActionResult<List<Photo>>> GetProfileForUser(string userId)
    {
        return HandleResult(await Mediator.Send(new GetProfilePhotos.Query { UserId = userId }));
    }

    [HttpDelete("{photoId}/photos")]
    public async Task<ActionResult> DeletePhoto(string photoId)
    {
        return HandleResult(await Mediator.Send(new DeletePhoto.Command { PhotoId = photoId }));
    }

    [HttpPut("{photoId}/setMain")]
    public async Task<ActionResult> SetMainPhoto(string photoId)
    {
        return HandleResult(await Mediator.Send(new SetMainProfile.Command
        {
            PhotoId = photoId
        }));
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<UserProfile>> GetProfile(string userId)
    {
        return HandleResult(await Mediator.Send(new GetProfile.Query { UserId = userId }));
    }

    // No route param: the handler edits whoever is logged in.
    [HttpPut]
    public async Task<ActionResult> EditProfile(EditProfileDto profileDto)
    {
        return HandleResult(await Mediator.Send(new EditProfile.Command { ProfileDto = profileDto }));
    }

    [HttpPost("{userId}/follow")]
    public async Task<ActionResult> FollowToggle(string userId)
    {
        return HandleResult(await Mediator.Send(new FollowToggle.Command { TargetUserId = userId }));
    }
    [HttpGet("{userId}/follow-list")]
    public async Task<ActionResult> GetFollowings(string userId, string predicate)
    {
        return HandleResult(await Mediator.Send(new GetFollowings.Query { UserId = userId, Predicate = predicate }));
    }
}