using System.Text;
using HISBackend.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Bugsnag.AspNet.Core;
using Bugsnag;
using Microsoft.AspNetCore.Diagnostics;
using HISBackend.Services;


var builder = WebApplication.CreateBuilder(args);


// Add BugSnag configuration


builder.Services.AddBugsnag(configuration => {
    configuration.ApiKey = "5737c307fc96e3e8e3f5db6a74363fbb";
    configuration.AppVersion = "1.0.0";
    configuration.ReleaseStage = builder.Environment.EnvironmentName;
    configuration.NotifyReleaseStages = new[] { "Development", "Staging", "Production" };

});

// Add services to the container
builder.Services.AddControllers();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder.AllowAnyOrigin()
                          .AllowAnyMethod()
                          .AllowAnyHeader());
});


// Configure SQLite
builder.Services.AddDbContext<MyAppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));


// Register JWT Authntication service 
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.UTF8.GetBytes(jwtSettings["Secret"]);

// Add Authentication services
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidAudience = jwtSettings["Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(secretKey)
        };
    });

// Register ISmsService and SmsService
builder.Services.Configure<TwilioSettings>(builder.Configuration.GetSection("TwilioSettings"));
builder.Services.AddScoped<ISmsService, SmsService>();

// Add Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Health Informatics System API",
        Version = "v1",
        Description = "API for managing healthcare system data"
    });
});

var app = builder.Build();



// Add global error handling
app.UseExceptionHandler(errApp => {
    errApp.Run(async context => {
        var bugsnag = context.RequestServices.GetService<IClient>();
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;

        bugsnag.Notify(exception, report => {
            report.Event.Metadata.Add("RequestPath", context.Request.Path);
            report.Event.Metadata.Add("RequestMethod", context.Request.Method);
        });

        context.Response.StatusCode = 500;
        await context.Response.WriteAsync("An unexpected error occurred");
    });
});


// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "HIS API v1");
    });
}

// Apply migrations automatically
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<MyAppDbContext>();
    db.Database.Migrate();
}

// Add before app.MapControllers()
app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        var bugsnag = context.RequestServices.GetRequiredService<IClient>();
        var exceptionHandlerFeature = context.Features.Get<IExceptionHandlerFeature>();

        if (exceptionHandlerFeature?.Error != null)
        {
            bugsnag.Notify(exceptionHandlerFeature.Error, report => {
                report.Event.Metadata.Add("Path", context.Request.Path);
                report.Event.Metadata.Add("Method", context.Request.Method);
            });
        }

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        await context.Response.WriteAsync("An error occurred");
    });
});
app.UseHttpsRedirection();
app.UseCors("RenderPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.UseCors("AllowAngularApp");
app.UseCors("AllowAll");

app.Run();

