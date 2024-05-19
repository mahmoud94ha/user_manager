import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { styled } from "@mui/system";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleXmark,
  faCircle,
  faCheckCircle,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";

const StyledCard = styled(Card)({
  maxWidth: "700px",
  marginBottom: "20px",
});

const IconCounter = ({ icon, label, count, icon_color }) => (
  <Box display="flex" alignItems="center" marginBottom="8px">
    <FontAwesomeIcon
      icon={icon}
      style={{ marginRight: "8px", color: icon_color }}
    />
    <Typography variant="body1">
      {label}: {count}
    </Typography>
  </Box>
);

const HomeComponent = ({ session }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.post("/api/dashboard/adminData");
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  if (!data) return <>Loading...</>;

  const {
    customersCount,
    usersCount,
    ticketsCount,
    bannedCustomersCount,
    repliedTicketsCount,
    nonRepliedTicketsCount,
    notBannedCustomersCount,
    notverfCustomersCount,
    verfCustomersCount
  } = data;

  const adminAccountsData = [
    { name: "Total", value: customersCount },
    { name: "Verified", value: verfCustomersCount },
    { name: "Not Verified", value: notverfCustomersCount },
    { name: "Banned", value: bannedCustomersCount },
    { name: "Not Banned", value: notBannedCustomersCount },
  ];

  const usersData = [
    { name: "Total", value: usersCount },
    { name: "Replied", value: repliedTicketsCount },
    { name: "Not Replied", value: nonRepliedTicketsCount },
  ];

  return (
    <Container style={{ overflowY: "auto", maxHeight: `80vh` }}>
      <Typography variant="h5" style={{ textTransform: "capitalize" }}>
        {session?.user?.role ? session?.user?.role : "..."} Dashboard
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" style={{ marginBottom: "10px" }}>
                Customers Accounts
              </Typography>
              <IconCounter
                icon={faCircle}
                icon_color="#4f499b"
                label="Total"
                count={customersCount}
              />
              <IconCounter
                icon={faCheckCircle}
                icon_color="green"
                label="Verified"
                count={verfCustomersCount}
              />
              <IconCounter
                icon={faCheckCircle}
                icon_color="red"
                label="Not Verified"
                count={notverfCustomersCount}
              />
              <IconCounter
                icon={faCheckCircle}
                icon_color="green"
                label="Not Banned"
                count={notBannedCustomersCount}
              />
              <IconCounter
                icon={faCircleXmark}
                icon_color="red"
                label="Banned"
                count={bannedCustomersCount}
              />
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6" style={{ marginBottom: "10px" }}>
              Support Tickets
              </Typography>
              <IconCounter
                icon={faCircle}
                icon_color="#4f499b"
                label="Total"
                count={ticketsCount}
              />
              <IconCounter
                icon={faCheckCircle}
                icon_color="green"
                label="Replied to Tickets"
                count={repliedTicketsCount}
              />
              <IconCounter
                icon={faTimesCircle}
                icon_color="red"
                label="Not Replied to Tickets"
                count={nonRepliedTicketsCount}
              />
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6">Customers Chart</Typography>
              <div style={{ overflow: "auto" }}>
                <AreaChart width={500} height={400} data={adminAccountsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                  />
                </AreaChart>
              </div>
            </CardContent>
          </StyledCard>
        </Grid>

        <Grid item xs={12} sm={6}>
          <StyledCard>
            <CardContent>
              <Typography variant="h6">Tickets Chart</Typography>
              <div style={{ overflow: "auto" }}>
                <BarChart width={400} height={400} data={usersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </div>
            </CardContent>
          </StyledCard>
        </Grid>
      </Grid>
      <Typography variant="p" style={{ textTransform: "capitalize" }}>
      </Typography>
    </Container>
  );
};

export default HomeComponent;
